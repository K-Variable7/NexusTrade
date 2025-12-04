const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PriceFeed", function () {
  let priceFeed;
  let mockAggregator;
  let owner;

  beforeEach(async function () {
    [owner] = await ethers.getSigners();

    // Deploy mock Chainlink aggregator
    const MockAggregator = await ethers.getContractFactory("MockAggregatorV3");
    mockAggregator = await MockAggregator.deploy();
    await mockAggregator.waitForDeployment();

    // Deploy PriceFeed with mock aggregator address
    const PriceFeed = await ethers.getContractFactory("PriceFeed");
    priceFeed = await PriceFeed.deploy(await mockAggregator.getAddress());
    await priceFeed.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the aggregator address correctly", async function () {
      // The contract stores the aggregator internally, we can verify by checking if getLatestPrice works
      await mockAggregator.setPrice(ethers.parseUnits("2000", 8)); // $2000 with 8 decimals
      const price = await priceFeed.getLatestPrice();
      expect(price).to.equal(ethers.parseUnits("2000", 8));
    });
  });

  describe("Price Retrieval", function () {
    it("Should return correct price from aggregator", async function () {
      const testPrice = ethers.parseUnits("3500", 8); // $3500
      await mockAggregator.setPrice(testPrice);

      const retrievedPrice = await priceFeed.getLatestPrice();
      expect(retrievedPrice).to.equal(testPrice);
    });

    it("Should handle different price values", async function () {
      // Test various price points
      const prices = [
        ethers.parseUnits("1000", 8),   // $1000
        ethers.parseUnits("50000", 8),  // $50000
        ethers.parseUnits("0.1", 8),    // $0.10
        ethers.parseUnits("999999", 8)  // $999999
      ];

      for (const price of prices) {
        await mockAggregator.setPrice(price);
        const retrievedPrice = await priceFeed.getLatestPrice();
        expect(retrievedPrice).to.equal(price);
      }
    });

    it("Should handle price updates correctly", async function () {
      // Initial price
      await mockAggregator.setPrice(ethers.parseUnits("3000", 8));
      expect(await priceFeed.getLatestPrice()).to.equal(ethers.parseUnits("3000", 8));

      // Updated price
      await mockAggregator.setPrice(ethers.parseUnits("4000", 8));
      expect(await priceFeed.getLatestPrice()).to.equal(ethers.parseUnits("4000", 8));
    });
  });

  describe("Aggregator Integration", function () {
    it("Should work with different aggregator addresses", async function () {
      // Deploy second mock aggregator
      const MockAggregator2 = await ethers.getContractFactory("MockAggregatorV3");
      const mockAggregator2 = await MockAggregator2.deploy();
      await mockAggregator2.waitForDeployment();

      // Deploy second PriceFeed
      const PriceFeed2 = await ethers.getContractFactory("PriceFeed");
      const priceFeed2 = await PriceFeed2.deploy(await mockAggregator2.getAddress());
      await priceFeed2.waitForDeployment();

      // Set different prices
      await mockAggregator.setPrice(ethers.parseUnits("2000", 8));
      await mockAggregator2.setPrice(ethers.parseUnits("3000", 8));

      // Verify different feeds return different prices
      expect(await priceFeed.getLatestPrice()).to.equal(ethers.parseUnits("2000", 8));
      expect(await priceFeed2.getLatestPrice()).to.equal(ethers.parseUnits("3000", 8));
    });
  });

  describe("Error Handling", function () {
    it("Should handle aggregator returning zero price", async function () {
      await mockAggregator.setPrice(0);
      const price = await priceFeed.getLatestPrice();
      expect(price).to.equal(0);
    });

    it("Should handle negative prices (if aggregator allows)", async function () {
      // Some aggregators might return negative values for extreme conditions
      const negativePrice = -ethers.parseUnits("100", 8);
      await mockAggregator.setPrice(negativePrice);
      const price = await priceFeed.getLatestPrice();
      expect(price).to.equal(negativePrice);
    });
  });
});