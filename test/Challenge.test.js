const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Challenge", function () {
  let challenge;
  let owner, addr1, addr2, addr3;

  beforeEach(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();
    const Challenge = await ethers.getContractFactory("Challenge");
    challenge = await Challenge.deploy();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await challenge.owner()).to.equal(owner.address);
    });
  });

  describe("Challenge Creation", function () {
    it("Should create challenges correctly", async function () {
      const description = "Weekly Trading Challenge";
      const duration = 604800; // 1 week
      const rewardAmount = ethers.parseEther("10");

      await expect(challenge.connect(owner).createChallenge(description, duration, { value: rewardAmount }))
        .to.emit(challenge, "ChallengeCreated")
        .withArgs(0, description);

      const challengeData = await challenge.challenges(0);
      expect(challengeData.description).to.equal(description);
      expect(challengeData.rewardPool).to.equal(rewardAmount);
      expect(challengeData.active).to.equal(true);
    });

    it("Should increment challenge count", async function () {
      await challenge.connect(owner).createChallenge("Challenge 1", 86400, { value: ethers.parseEther("1") });
      await challenge.connect(owner).createChallenge("Challenge 2", 86400, { value: ethers.parseEther("1") });

      expect(await challenge.challengeCount()).to.equal(2);
    });

    it("Should only allow owner to create challenges", async function () {
      await expect(challenge.connect(addr1).createChallenge("Test", 86400, { value: ethers.parseEther("1") }))
        .to.be.revertedWithCustomError(challenge, "OwnableUnauthorizedAccount");
    });
  });

  describe("Challenge Participation", function () {
    beforeEach(async function () {
      await challenge.connect(owner).createChallenge("Test Challenge", 86400, { value: ethers.parseEther("10") });
    });

    it("Should allow users to join challenges", async function () {
      await expect(challenge.connect(addr1).joinChallenge(0))
        .to.emit(challenge, "JoinedChallenge")
        .withArgs(0, addr1.address);

      const participants = await challenge.getParticipants(0);
      expect(participants).to.include(addr1.address);
    });

    it("Should prevent joining inactive challenges", async function () {
      await challenge.connect(owner).endChallenge(0);

      await expect(challenge.connect(addr1).joinChallenge(0))
        .to.be.revertedWith("Challenge not active");
    });

    it("Should prevent joining expired challenges", async function () {
      await time.increase(86401); // Past expiration

      await expect(challenge.connect(addr1).joinChallenge(0))
        .to.be.revertedWith("Challenge ended");
    });

    it("Should handle multiple participants", async function () {
      await challenge.connect(addr1).joinChallenge(0);
      await challenge.connect(addr2).joinChallenge(0);
      await challenge.connect(addr3).joinChallenge(0);

      const participants = await challenge.getParticipants(0);
      expect(participants).to.have.lengthOf(3);
      expect(participants).to.include(addr1.address);
      expect(participants).to.include(addr2.address);
      expect(participants).to.include(addr3.address);
    });
  });

  describe("Score Management", function () {
    beforeEach(async function () {
      await challenge.connect(owner).createChallenge("Test Challenge", 86400, { value: ethers.parseEther("10") });
      await challenge.connect(addr1).joinChallenge(0);
      await challenge.connect(addr2).joinChallenge(0);
    });

    it("Should allow owner to update scores", async function () {
      await challenge.connect(owner).updateScore(0, addr1.address, 100);
      await challenge.connect(owner).updateScore(0, addr2.address, 85);

      const challengeData = await challenge.challenges(0);
      expect(await challenge.getScore(0, addr1.address)).to.equal(100);
      expect(await challenge.getScore(0, addr2.address)).to.equal(85);
    });

    it("Should not allow non-owner to update scores", async function () {
      await expect(challenge.connect(addr1).updateScore(0, addr2.address, 100))
        .to.be.revertedWithCustomError(challenge, "OwnableUnauthorizedAccount");
    });
  });

  describe("Challenge Ending", function () {
    beforeEach(async function () {
      await challenge.connect(owner).createChallenge("Test Challenge", 86400, { value: ethers.parseEther("10") });
      await challenge.connect(addr1).joinChallenge(0);
      await challenge.connect(addr2).joinChallenge(0);
      await challenge.connect(owner).updateScore(0, addr1.address, 100);
      await challenge.connect(owner).updateScore(0, addr2.address, 85);
    });

    it("Should allow owner to end challenges", async function () {
      await expect(challenge.connect(owner).endChallenge(0))
        .to.emit(challenge, "ChallengeEnded")
        .withArgs(0, addr1.address); // addr1 should be winner with higher score

      const challengeData = await challenge.challenges(0);
      expect(challengeData.active).to.equal(false);
      expect(challengeData.winner).to.equal(addr1.address);
    });

    it("Should determine winner correctly", async function () {
      await challenge.connect(owner).endChallenge(0);

      const challengeData = await challenge.challenges(0);
      expect(challengeData.winner).to.equal(addr1.address);
    });

    it("Should distribute rewards to winner", async function () {
      const initialBalance = await ethers.provider.getBalance(addr1.address);

      await challenge.connect(owner).endChallenge(0);

      const finalBalance = await ethers.provider.getBalance(addr1.address);
      expect(finalBalance - initialBalance).to.equal(ethers.parseEther("10"));
    });

    it("Should not allow ending already ended challenges", async function () {
      await challenge.connect(owner).endChallenge(0);

      await expect(challenge.connect(owner).endChallenge(0))
        .to.be.revertedWith("Challenge already ended");
    });

    it("Should only allow owner to end challenges", async function () {
      await expect(challenge.connect(addr1).endChallenge(0))
        .to.be.revertedWithCustomError(challenge, "OwnableUnauthorizedAccount");
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await challenge.connect(owner).createChallenge("Test Challenge", 86400, { value: ethers.parseEther("10") });
    });

    it("Should return correct challenge data", async function () {
      const challengeData = await challenge.challenges(0);
      expect(challengeData.description).to.equal("Test Challenge");
      expect(challengeData.rewardPool).to.equal(ethers.parseEther("10"));
      expect(challengeData.active).to.equal(true);
    });

    it("Should return correct scores", async function () {
      await challenge.connect(owner).updateScore(0, addr1.address, 100);
      expect(await challenge.getScore(0, addr1.address)).to.equal(100);
      expect(await challenge.getScore(0, addr2.address)).to.equal(0);
    });
  });
});