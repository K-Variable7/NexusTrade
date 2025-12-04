const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AccessNFT", function () {
  let accessNFT;
  let owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const AccessNFT = await ethers.getContractFactory("AccessNFT");
    accessNFT = await AccessNFT.deploy(owner.address);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await accessNFT.owner()).to.equal(owner.address);
    });

    it("Should have correct name and symbol", async function () {
      expect(await accessNFT.name()).to.equal("GovBlockTrade Access");
      expect(await accessNFT.symbol()).to.equal("GBTACCESS");
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint NFTs", async function () {
      await accessNFT.connect(owner).safeMint(addr1.address);
      expect(await accessNFT.ownerOf(0)).to.equal(addr1.address);
    });

    it("Should not allow non-owner to mint NFTs", async function () {
      await expect(accessNFT.connect(addr1).safeMint(addr2.address))
        .to.be.revertedWithCustomError(accessNFT, "OwnableUnauthorizedAccount");
    });

    it("Should increment token IDs correctly", async function () {
      await accessNFT.connect(owner).safeMint(addr1.address);
      await accessNFT.connect(owner).safeMint(addr2.address);

      expect(await accessNFT.ownerOf(0)).to.equal(addr1.address);
      expect(await accessNFT.ownerOf(1)).to.equal(addr2.address);
    });

    it("Should return correct token URI", async function () {
      await accessNFT.connect(owner).safeMint(addr1.address);
      expect(await accessNFT.tokenURI(0)).to.equal("https://your-api.com/metadata/0");
    });
  });

  describe("Transfers", function () {
    beforeEach(async function () {
      await accessNFT.connect(owner).safeMint(owner.address);
    });

    it("Should allow transfers between users", async function () {
      await accessNFT.connect(owner).transferFrom(owner.address, addr1.address, 0);
      expect(await accessNFT.ownerOf(0)).to.equal(addr1.address);
    });

    it("Should update balances correctly", async function () {
      expect(await accessNFT.balanceOf(owner.address)).to.equal(1);
      expect(await accessNFT.balanceOf(addr1.address)).to.equal(0);

      await accessNFT.connect(owner).transferFrom(owner.address, addr1.address, 0);

      expect(await accessNFT.balanceOf(owner.address)).to.equal(0);
      expect(await accessNFT.balanceOf(addr1.address)).to.equal(1);
    });
  });

  describe("Approvals", function () {
    beforeEach(async function () {
      await accessNFT.connect(owner).safeMint(owner.address);
    });

    it("Should allow setting approvals", async function () {
      await accessNFT.connect(owner).approve(addr1.address, 0);
      expect(await accessNFT.getApproved(0)).to.equal(addr1.address);
    });

    it("Should allow approved address to transfer", async function () {
      await accessNFT.connect(owner).approve(addr1.address, 0);
      await accessNFT.connect(addr1).transferFrom(owner.address, addr2.address, 0);
      expect(await accessNFT.ownerOf(0)).to.equal(addr2.address);
    });
  });
});