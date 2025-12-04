const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Integration Tests", function () {
  let strategyNFT;
  let accessNFT;
  let tradingPool;
  let challenge;
  let priceFeed;
  let mockAggregator;
  let mockToken;
  let owner, user1, user2, user3;

  beforeEach(async function () {
    [owner, user1, user2, user3] = await ethers.getSigners();

    // Deploy mock contracts
    const MockAggregator = await ethers.getContractFactory("MockAggregatorV3");
    mockAggregator = await MockAggregator.deploy();

    const MockToken = await ethers.getContractFactory("MockERC20");
    mockToken = await MockToken.deploy("Mock Token", "MOCK", ethers.parseEther("1000000"));

    // Deploy core contracts
    const StrategyNFT = await ethers.getContractFactory("StrategyNFT");
    strategyNFT = await StrategyNFT.deploy();

    const AccessNFT = await ethers.getContractFactory("AccessNFT");
    accessNFT = await AccessNFT.deploy(owner.address);

    const TradingPool = await ethers.getContractFactory("TradingPool");
    tradingPool = await TradingPool.deploy(user3.address);

    const Challenge = await ethers.getContractFactory("Challenge");
    challenge = await Challenge.deploy();

    const PriceFeed = await ethers.getContractFactory("PriceFeed");
    priceFeed = await PriceFeed.deploy(await mockAggregator.getAddress());

    // Setup initial state
    await mockToken.transfer(user1.address, ethers.parseEther("10000"));
    await mockToken.transfer(user2.address, ethers.parseEther("10000"));
    await mockAggregator.setPrice(ethers.parseUnits("3000", 8)); // $3000 ETH
  });

  describe("Complete User Journey", function () {
    it("Should handle a complete user trading journey", async function () {
      // Step 1: User gets access NFT
      await accessNFT.connect(owner).safeMint(user1.address);
      expect(await accessNFT.ownerOf(0)).to.equal(user1.address);

      // Step 2: User creates a trading strategy NFT
      await strategyNFT.connect(user1).mintStrategy(
        "My Strategy",
        "A profitable trading strategy",
        ethers.parseEther("0.1")
      );
      expect(await strategyNFT.ownerOf(0)).to.equal(user1.address);

      // Step 3: User joins a trading pool
      await tradingPool.connect(owner).createPool("Weekly Pool", 604800); // 1 week
      await mockToken.connect(user1).approve(await tradingPool.getAddress(), ethers.parseEther("100"));
      await tradingPool.connect(user1).joinPool(0, ethers.parseEther("100"), await mockToken.getAddress());

      const poolDeposits = await tradingPool.getPoolDeposits(0, user1.address);
      expect(poolDeposits).to.equal(ethers.parseEther("100"));

      // Step 4: User participates in a challenge
      await challenge.connect(owner).createChallenge("Weekly Challenge", 604800, { value: ethers.parseEther("5") });
      await challenge.connect(user1).joinChallenge(0);
      await challenge.connect(owner).updateScore(0, user1.address, 95);

      // Step 5: Verify price feed works
      const price = await priceFeed.getLatestPrice();
      expect(price).to.equal(ethers.parseUnits("3000", 8));

      // Step 6: Challenge ends and winner gets reward
      const initialBalance = await ethers.provider.getBalance(user1.address);
      await challenge.connect(owner).endChallenge(0);
      const finalBalance = await ethers.provider.getBalance(user1.address);

      expect(finalBalance - initialBalance).to.equal(ethers.parseEther("5"));
    });
  });

  describe("Cross-Contract Interactions", function () {
    beforeEach(async function () {
      // Setup initial NFTs and pools
      await accessNFT.connect(owner).safeMint(user1.address);
      await accessNFT.connect(owner).safeMint(user2.address);
      await strategyNFT.connect(user1).mintStrategy("Strategy 1", "Desc 1", ethers.parseEther("0.1"));
      await strategyNFT.connect(user2).mintStrategy("Strategy 2", "Desc 2", ethers.parseEther("0.1"));
      await tradingPool.connect(owner).createPool("Test Pool", 86400);
    });

    it("Should handle multiple users interacting with all contracts", async function () {
      // Both users join the pool
      await mockToken.connect(user1).approve(await tradingPool.getAddress(), ethers.parseEther("200"));
      await mockToken.connect(user2).approve(await tradingPool.getAddress(), ethers.parseEther("300"));

      await tradingPool.connect(user1).joinPool(0, ethers.parseEther("200"), await mockToken.getAddress());
      await tradingPool.connect(user2).joinPool(0, ethers.parseEther("300"), await mockToken.getAddress());

      // Check pool deposits
      expect(await tradingPool.getPoolDeposits(0, user1.address)).to.equal(ethers.parseEther("200"));
      expect(await tradingPool.getPoolDeposits(0, user2.address)).to.equal(ethers.parseEther("300"));

      // Both users join challenge
      await challenge.connect(owner).createChallenge("Multi-user Challenge", 86400, { value: ethers.parseEther("10") });
      await challenge.connect(user1).joinChallenge(0);
      await challenge.connect(user2).joinChallenge(0);

      // Set scores - user2 wins
      await challenge.connect(owner).updateScore(0, user1.address, 85);
      await challenge.connect(owner).updateScore(0, user2.address, 92);

      // End challenge and verify winner gets reward
      const initialBalance = await ethers.provider.getBalance(user2.address);
      await challenge.connect(owner).endChallenge(0);
      const finalBalance = await ethers.provider.getBalance(user2.address);

      expect(finalBalance - initialBalance).to.equal(ethers.parseEther("10"));
    });

    it("Should handle emergency scenarios correctly", async function () {
      // Users deposit into pool
      await mockToken.connect(user1).approve(await tradingPool.getAddress(), ethers.parseEther("100"));
      await tradingPool.connect(user1).joinPool(0, ethers.parseEther("100"), await mockToken.getAddress());

      // Emergency pause
      await tradingPool.connect(owner).emergencyPause();

      // Should not allow new pools or deposits
      await expect(tradingPool.connect(owner).createPool("Emergency Pool", 86400))
        .to.be.revertedWith("Emergency paused");

      await expect(tradingPool.connect(user2).joinPool(0, ethers.parseEther("50"), await mockToken.getAddress()))
        .to.be.revertedWith("Emergency paused");

      // Emergency withdraw
      const initialOwnerBalance = await mockToken.balanceOf(owner.address);
      await tradingPool.connect(owner).emergencyWithdraw(await mockToken.getAddress());
      const finalOwnerBalance = await mockToken.balanceOf(owner.address);

      expect(finalOwnerBalance - initialOwnerBalance).to.equal(ethers.parseEther("100"));
    });
  });

  describe("Economic Model Validation", function () {
    it("Should correctly handle fees and rewards distribution", async function () {
      // Create pool and have users deposit
      await tradingPool.connect(owner).createPool("Fee Test Pool", 86400);

      await mockToken.connect(user1).approve(await tradingPool.getAddress(), ethers.parseEther("1000"));
      await mockToken.connect(user2).approve(await tradingPool.getAddress(), ethers.parseEther("2000"));

      await tradingPool.connect(user1).joinPool(0, ethers.parseEther("1000"), await mockToken.getAddress());
      await tradingPool.connect(user2).joinPool(0, ethers.parseEther("2000"), await mockToken.getAddress());

      // Close pool - this should distribute fees
      const initialOwnerTokenBalance = await mockToken.balanceOf(owner.address);
      const initialRewardPoolTokenBalance = await mockToken.balanceOf(user3.address);

      await tradingPool.connect(owner).closePool(0);

      const finalOwnerTokenBalance = await mockToken.balanceOf(owner.address);
      const finalRewardPoolTokenBalance = await mockToken.balanceOf(user3.address);

      // Tax rate is 5%, so 5% of 3000 = 150, split between owner and reward pool = 75 each
      const expectedFee = ethers.parseEther("75");
      expect(finalOwnerTokenBalance - initialOwnerTokenBalance).to.equal(expectedFee);
      expect(finalRewardPoolTokenBalance - initialRewardPoolTokenBalance).to.equal(expectedFee);
    });

    it("Should validate NFT trading economics", async function () {
      // User1 creates expensive strategy
      const strategyPrice = ethers.parseEther("2");
      await strategyNFT.connect(user1).mintStrategy("Premium Strategy", "High-end strategy", strategyPrice);

      // User2 buys it
      const initialUser1Balance = await ethers.provider.getBalance(user1.address);
      await strategyNFT.connect(user2).buyStrategy(0, { value: strategyPrice });
      const finalUser1Balance = await ethers.provider.getBalance(user1.address);

      // User1 should receive the payment
      expect(finalUser1Balance - initialUser1Balance).to.equal(strategyPrice);

      // Ownership should transfer
      expect(await strategyNFT.ownerOf(0)).to.equal(user2.address);
    });
  });

  describe("Time-based Operations", function () {
    it("Should handle time-sensitive operations correctly", async function () {
      // Create short-duration pool and challenge
      await tradingPool.connect(owner).createPool("Quick Pool", 3600); // 1 hour
      await challenge.connect(owner).createChallenge("Quick Challenge", 3600, { value: ethers.parseEther("1") });

      // Users join
      await mockToken.connect(user1).approve(await tradingPool.getAddress(), ethers.parseEther("100"));
      await tradingPool.connect(user1).joinPool(0, ethers.parseEther("100"), await mockToken.getAddress());
      await challenge.connect(user1).joinChallenge(0);

      // Advance time past expiration
      await time.increase(3700); // 1 hour + 100 seconds

      // Should not allow joining expired activities
      await expect(tradingPool.connect(user2).joinPool(0, ethers.parseEther("50"), await mockToken.getAddress()))
        .to.be.revertedWith("Pool ended");

      await expect(challenge.connect(user2).joinChallenge(0))
        .to.be.revertedWith("Challenge ended");

      // But should still allow ending challenge
      await challenge.connect(owner).updateScore(0, user1.address, 100);
      await challenge.connect(owner).endChallenge(0);
    });
  });
});