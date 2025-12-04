const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🚀 Creating Initial Challenges...\n");

  // Load deployment info
  let deploymentInfo;
  try {
    deploymentInfo = JSON.parse(fs.readFileSync("deployment-tenderly.json", "utf8"));
  } catch (error) {
    console.error("❌ Could not load deployment info. Run deploy-tenderly.js first.");
    process.exit(1);
  }

  const challengeAddress = deploymentInfo.contracts.Challenge;
  const nexusTokenAddress = deploymentInfo.contracts.NexusToken;

  if (!challengeAddress || !nexusTokenAddress) {
    console.error("❌ Missing contract addresses in deployment info.");
    process.exit(1);
  }

  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);

  // Get contract instances
  const Challenge = await ethers.getContractFactory("Challenge");
  const challenge = Challenge.attach(challengeAddress);

  const NexusToken = await ethers.getContractFactory("NexusToken");
  const nexusToken = NexusToken.attach(nexusTokenAddress);

  // Approve Challenge contract to spend tokens for rewards
  const totalRewardAmount = ethers.parseEther("10000"); // 10k tokens for rewards
  console.log("Approving Challenge contract to spend tokens...");
  const approveTx = await nexusToken.approve(challengeAddress, totalRewardAmount);
  await approveTx.wait();
  console.log("✅ Approved.");

  // Create Challenges
  const challenges = [
    {
      name: 'Weekly Profit Hunter',
      description: 'Achieve 5% profit on your portfolio within 7 days',
      duration: 7 * 24 * 60 * 60, // 7 days
      reward: ethers.parseEther("1000")
    },
    {
      name: 'DeFi Explorer',
      description: 'Try 5 different DeFi protocols and earn rewards',
      duration: 14 * 24 * 60 * 60, // 14 days
      reward: ethers.parseEther("500")
    },
    {
      name: 'Volume Champion',
      description: 'Generate $10,000 in trading volume this month',
      duration: 30 * 24 * 60 * 60, // 30 days
      reward: ethers.parseEther("2000")
    },
    {
      name: 'Risk Manager',
      description: 'Maintain a Sharpe ratio > 2 for 30 days',
      duration: 30 * 24 * 60 * 60, // 30 days
      reward: ethers.parseEther("1500")
    }
  ];

  for (const c of challenges) {
    console.log(`Creating challenge: ${c.name}...`);
    const tx = await challenge.createChallenge(
      c.name,
      c.description,
      c.duration,
      c.reward
    );
    await tx.wait();
    console.log(`✅ Created ${c.name}`);
  }

  console.log("\n🎉 All challenges created!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
