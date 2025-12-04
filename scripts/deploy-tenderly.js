const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting NexusTrade Deployment to Tenderly...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Deploy NexusToken (formerly MockERC20)
  console.log("📄 Deploying NexusToken...");
  const NexusToken = await ethers.getContractFactory("NexusToken");
  const nexusToken = await NexusToken.deploy(
    deployer.address, // treasuryWallet
    deployer.address, // teamWallet
    deployer.address  // rewardsPool
  );
  await nexusToken.waitForDeployment();
  const nexusTokenAddress = await nexusToken.getAddress();
  console.log("✅ NexusToken deployed to:", nexusTokenAddress);

  // Deploy NexusSwap
  console.log("🔄 Deploying NexusSwap...");
  const NexusSwap = await ethers.getContractFactory("NexusSwap");
  const nexusSwap = await NexusSwap.deploy(
    nexusTokenAddress, // nexusToken
    ethers.ZeroAddress, // weth (using zero address for now)
    deployer.address, // treasuryWallet
    deployer.address  // rewardsPool
  );
  await nexusSwap.waitForDeployment();
  const nexusSwapAddress = await nexusSwap.getAddress();
  console.log("✅ NexusSwap deployed to:", nexusSwapAddress);

  // Deploy TradingPool
  console.log("🏊 Deploying TradingPool...");
  const TradingPool = await ethers.getContractFactory("TradingPool");
  const tradingPool = await TradingPool.deploy(nexusTokenAddress);
  await tradingPool.waitForDeployment();
  const tradingPoolAddress = await tradingPool.getAddress();
  console.log("✅ TradingPool deployed to:", tradingPoolAddress);

  // Deploy Challenge
  console.log("🏆 Deploying Challenge...");
  const Challenge = await ethers.getContractFactory("Challenge");
  const challenge = await Challenge.deploy(nexusTokenAddress);
  await challenge.waitForDeployment();
  const challengeAddress = await challenge.getAddress();
  console.log("✅ Challenge deployed to:", challengeAddress);

  // Deploy Staking
  console.log("🔒 Deploying Staking...");
  const Staking = await ethers.getContractFactory("Staking");
  const staking = await Staking.deploy(nexusTokenAddress);
  await staking.waitForDeployment();
  const stakingAddress = await staking.getAddress();
  console.log("✅ Staking deployed to:", stakingAddress);

  console.log("\n🎉 Deployment Complete!");
  console.log("========================================");
  console.log("Contract Addresses:");
  console.log("NexusToken:", nexusTokenAddress);
  console.log("NexusSwap:", nexusSwapAddress);
  console.log("TradingPool:", tradingPoolAddress);
  console.log("Challenge:", challengeAddress);
  console.log("Staking:", stakingAddress);
  console.log("========================================");

  // Save deployment info
  const deploymentInfo = {
    network: "tenderly",
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      NexusToken: nexusTokenAddress,
      NexusSwap: nexusSwapAddress,
      TradingPool: tradingPoolAddress,
      Challenge: challengeAddress,
      Staking: stakingAddress,
    }
  };

  console.log("\n💾 Saving deployment info...");
  const fs = require("fs");
  fs.writeFileSync("deployment-tenderly.json", JSON.stringify(deploymentInfo, null, 2));
  console.log("✅ Deployment info saved to deployment-tenderly.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });