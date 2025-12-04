const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("StrategyNFT", function () {
  let strategyNFT;
  let owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const StrategyNFT = await ethers.getContractFactory("StrategyNFT");
    strategyNFT = await StrategyNFT.deploy();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await strategyNFT.owner()).to.equal(owner.address);
    });

    it("Should have correct name and symbol", async function () {
      expect(await strategyNFT.name()).to.equal("Trading Strategy");
      expect(await strategyNFT.symbol()).to.equal("STRAT");
    });
  });

  describe("Minting", function () {
    it("Should mint strategy NFTs correctly", async function () {
      await strategyNFT.connect(owner).mintStrategy("Test Strategy", "A test strategy", 100);
      const strategy = await strategyNFT.strategies(0);

      expect(strategy.name).to.equal("Test Strategy");
      expect(strategy.description).to.equal("A test strategy");
      expect(strategy.price).to.equal(100);
      expect(strategy.creator).to.equal(owner.address);
    });

    it("Should increment token IDs correctly", async function () {
      await strategyNFT.connect(owner).mintStrategy("Strategy 1", "Desc 1", 100);
      await strategyNFT.connect(owner).mintStrategy("Strategy 2", "Desc 2", 200);

      expect(await strategyNFT.ownerOf(0)).to.equal(owner.address);
      expect(await strategyNFT.ownerOf(1)).to.equal(owner.address);
    });

    it("Should emit StrategyCreated event", async function () {
      await expect(strategyNFT.connect(owner).mintStrategy("Test", "Desc", 100))
        .to.emit(strategyNFT, "StrategyCreated")
        .withArgs(0, owner.address, "Test", "Desc", 100);
    });
  });

  describe("Trading", function () {
    beforeEach(async function () {
      await strategyNFT.connect(owner).mintStrategy("Premium Strategy", "High performance", ethers.parseEther("1"));
    });

    it("Should allow buying strategies with correct payment", async function () {
      const price = ethers.parseEther("1");
      await expect(strategyNFT.connect(addr1).buyStrategy(0, { value: price }))
        .to.emit(strategyNFT, "StrategySold")
        .withArgs(0, owner.address, addr1.address, price);

      expect(await strategyNFT.ownerOf(0)).to.equal(addr1.address);
    });

    it("Should reject insufficient payment", async function () {
      const insufficientPrice = ethers.parseEther("0.5");
      await expect(
        strategyNFT.connect(addr1).buyStrategy(0, { value: insufficientPrice })
      ).to.be.revertedWith("Insufficient payment");
    });

    it("Should transfer funds to seller", async function () {
      const price = ethers.parseEther("1");
      const initialBalance = await ethers.provider.getBalance(owner.address);

      await strategyNFT.connect(addr1).buyStrategy(0, { value: price });

      const finalBalance = await ethers.provider.getBalance(owner.address);
      expect(finalBalance - initialBalance).to.equal(price);
    });
  });

  describe("Access Control", function () {
    it("Should only allow owner to update base URI", async function () {
      await expect(strategyNFT.connect(addr1).setBaseURI("new-uri"))
        .to.be.revertedWithCustomError(strategyNFT, "OwnableUnauthorizedAccount");
    });

    it("Should allow owner to update base URI", async function () {
      await strategyNFT.connect(owner).setBaseURI("https://new-api.com/");
      expect(await strategyNFT.baseURI()).to.equal("https://new-api.com/");
    });
  });
});