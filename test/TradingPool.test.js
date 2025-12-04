const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("TradingPool", function () {
  let tradingPool;
  let mockToken;
  let owner, addr1, addr2, addr3;
  let rewardPool;

  beforeEach(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();
    rewardPool = addr3.address;

    // Deploy mock ERC20 token for testing
    const MockToken = await ethers.getContractFactory("MockERC20");
    mockToken = await MockToken.deploy("Mock Token", "MOCK", ethers.parseEther("1000000"));
    await mockToken.waitForDeployment();

    // Deploy TradingPool
    const TradingPool = await ethers.getContractFactory("TradingPool");
    tradingPool = await TradingPool.deploy(rewardPool);
    await tradingPool.waitForDeployment();

    // Transfer tokens to test users
    await mockToken.transfer(addr1.address, ethers.parseEther("10000"));
    await mockToken.transfer(addr2.address, ethers.parseEther("10000"));
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await tradingPool.owner()).to.equal(owner.address);
    });

    it("Should set the reward pool correctly", async function () {
      expect(await tradingPool.rewardPool()).to.equal(rewardPool);
    });

    it("Should initialize with correct tax rate", async function () {
      expect(await tradingPool.taxRate()).to.equal(5);
    });
  });

  describe("Pool Creation", function () {
    it("Should create pools correctly", async function () {
      const poolName = "Test Pool";
      const duration = 86400; // 1 day

      await expect(tradingPool.connect(owner).createPool(poolName, duration))
        .to.emit(tradingPool, "PoolCreated")
        .withArgs(0, owner.address, poolName);

      const pool = await tradingPool.pools(0);
      expect(pool.creator).to.equal(owner.address);
      expect(pool.name).to.equal(poolName);
      expect(pool.active).to.equal(true);
      expect(pool.totalDeposits).to.equal(0);
    });

    it("Should increment pool count", async function () {
      await tradingPool.connect(owner).createPool("Pool 1", 86400);
      await tradingPool.connect(owner).createPool("Pool 2", 86400);

      expect(await tradingPool.poolCount()).to.equal(2);
    });
  });

  describe("Pool Joining", function () {
    const depositAmount = ethers.parseEther("100");

    beforeEach(async function () {
      await tradingPool.connect(owner).createPool("Test Pool", 86400);
      // Approve tokens for spending
      await mockToken.connect(addr1).approve(await tradingPool.getAddress(), depositAmount);
      await mockToken.connect(addr2).approve(await tradingPool.getAddress(), depositAmount * 2n);
    });

    it("Should allow users to join pools", async function () {
      await expect(tradingPool.connect(addr1).joinPool(0, depositAmount, await mockToken.getAddress()))
        .to.emit(tradingPool, "JoinedPool")
        .withArgs(0, addr1.address, depositAmount);

      const pool = await tradingPool.pools(0);
      expect(pool.totalDeposits).to.equal(depositAmount);
      expect(await tradingPool.getPoolDeposits(0, addr1.address)).to.equal(depositAmount);
    });

    it("Should transfer tokens correctly", async function () {
      const initialBalance = await mockToken.balanceOf(addr1.address);
      const initialContractBalance = await mockToken.balanceOf(await tradingPool.getAddress());

      await tradingPool.connect(addr1).joinPool(0, depositAmount, await mockToken.getAddress());

      expect(await mockToken.balanceOf(addr1.address)).to.equal(initialBalance - depositAmount);
      expect(await mockToken.balanceOf(await tradingPool.getAddress())).to.equal(initialContractBalance + depositAmount);
    });

    it("Should reject joining inactive pools", async function () {
      await tradingPool.connect(owner).closePool(0);

      await expect(tradingPool.connect(addr1).joinPool(0, depositAmount, await mockToken.getAddress()))
        .to.be.revertedWith("Pool not active");
    });

    it("Should reject joining expired pools", async function () {
      await time.increase(86401); // Past expiration

      await expect(tradingPool.connect(addr1).joinPool(0, depositAmount, await mockToken.getAddress()))
        .to.be.revertedWith("Pool ended");
    });

    it("Should handle multiple users joining", async function () {
      await tradingPool.connect(addr1).joinPool(0, depositAmount, await mockToken.getAddress());
      await tradingPool.connect(addr2).joinPool(0, depositAmount * 2n, await mockToken.getAddress());

      const pool = await tradingPool.pools(0);
      expect(pool.totalDeposits).to.equal(depositAmount * 3n);
      expect(await tradingPool.getPoolDeposits(0, addr1.address)).to.equal(depositAmount);
      expect(await tradingPool.getPoolDeposits(0, addr2.address)).to.equal(depositAmount * 2n);
    });
  });

  describe("Pool Closing", function () {
    beforeEach(async function () {
      await tradingPool.connect(owner).createPool("Test Pool", 86400);
    });

    it("Should allow owner to close pools", async function () {
      // First make some deposits
      await mockToken.connect(addr1).approve(await tradingPool.getAddress(), ethers.parseEther("100"));
      await mockToken.connect(addr2).approve(await tradingPool.getAddress(), ethers.parseEther("200"));
      await tradingPool.connect(addr1).joinPool(0, ethers.parseEther("100"), await mockToken.getAddress());
      await tradingPool.connect(addr2).joinPool(0, ethers.parseEther("200"), await mockToken.getAddress());

      const netPositive = ethers.parseEther("300"); // 100 + 200

      await expect(tradingPool.connect(owner).closePool(0))
        .to.emit(tradingPool, "PoolClosed")
        .withArgs(0, netPositive);

      const pool = await tradingPool.pools(0);
      expect(pool.active).to.equal(false);
    });

    it("Should only allow owner to close pools", async function () {
      await expect(tradingPool.connect(addr1).closePool(0))
        .to.be.revertedWithCustomError(tradingPool, "OwnableUnauthorizedAccount");
    });
  });

  describe("Tax Collection", function () {
    it("Should allow owner to update tax rate", async function () {
      await tradingPool.connect(owner).setTaxRate(10);
      expect(await tradingPool.taxRate()).to.equal(10);
    });

    it("Should not allow non-owner to update tax rate", async function () {
      await expect(tradingPool.connect(addr1).setTaxRate(10))
        .to.be.revertedWithCustomError(tradingPool, "OwnableUnauthorizedAccount");
    });

    it("Should enforce tax rate limits", async function () {
      await expect(tradingPool.connect(owner).setTaxRate(101))
        .to.be.revertedWith("Tax rate must be <= 100%");
    });
  });

  describe("Emergency Functions", function () {
    it("Should allow owner to pause pools", async function () {
      await tradingPool.connect(owner).emergencyPause();
      expect(await tradingPool.emergencyPaused()).to.equal(true);
    });

    it("Should allow owner to emergency withdraw", async function () {
      const depositAmount = ethers.parseEther("100");
      await tradingPool.connect(owner).createPool("Test Pool", 86400);

      await mockToken.connect(addr1).approve(await tradingPool.getAddress(), depositAmount);
      await tradingPool.connect(addr1).joinPool(0, depositAmount, await mockToken.getAddress());

      const initialBalance = await mockToken.balanceOf(owner.address);
      await tradingPool.connect(owner).emergencyWithdraw(await mockToken.getAddress());

      expect(await mockToken.balanceOf(owner.address)).to.be.greaterThan(initialBalance);
    });
  });
});