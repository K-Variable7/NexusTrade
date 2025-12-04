const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting NexusTrade Deployment to Sepolia...\n");

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

  // Deploy MockAggregatorV3 for price feeds
  console.log("📊 Deploying MockAggregatorV3...");
  const MockAggregator = await ethers.getContractFactory("MockAggregatorV3");
  const mockAggregator = await MockAggregator.deploy();
  await mockAggregator.waitForDeployment();
  console.log("✅ MockAggregatorV3 deployed to:", await mockAggregator.getAddress());

  // Set initial price (3000 USD per ETH)
  await mockAggregator.setPrice(ethers.parseUnits("3000", 8));
  console.log("✅ Mock price set to $3000 per ETH");

  // Deploy AccessNFT
  console.log("🎫 Deploying AccessNFT...");
  const AccessNFT = await ethers.getContractFactory("AccessNFT");
  const accessNFT = await AccessNFT.deploy(deployer.address);
  await accessNFT.waitForDeployment();
  console.log("✅ AccessNFT deployed to:", await accessNFT.getAddress());

  // Deploy StrategyNFT
  console.log("📈 Deploying StrategyNFT...");
  const StrategyNFT = await ethers.getContractFactory("StrategyNFT");
  const strategyNFT = await StrategyNFT.deploy();
  await strategyNFT.waitForDeployment();
  console.log("✅ StrategyNFT deployed to:", await strategyNFT.getAddress());

  // Deploy TradingPool (using deployer as reward pool for now)
  console.log("🏦 Deploying TradingPool...");
  const TradingPool = await ethers.getContractFactory("TradingPool");
  const tradingPool = await TradingPool.deploy(deployer.address);
  await tradingPool.waitForDeployment();
  console.log("✅ TradingPool deployed to:", await tradingPool.getAddress());

  // Deploy Challenge
  console.log("🏆 Deploying Challenge...");
  const Challenge = await ethers.getContractFactory("Challenge");
  const challenge = await Challenge.deploy();
  await challenge.waitForDeployment();
  console.log("✅ Challenge deployed to:", await challenge.getAddress());

  // Deploy PriceFeed
  console.log("💰 Deploying PriceFeed...");
  const PriceFeed = await ethers.getContractFactory("PriceFeed");
  const priceFeed = await PriceFeed.deploy(await mockAggregator.getAddress());
  await priceFeed.waitForDeployment();
  console.log("✅ PriceFeed deployed to:", await priceFeed.getAddress());

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

  // Setup initial state
  console.log("\n🔧 Setting up initial state...");

  // Mint some AccessNFTs for testing
  console.log("Minting AccessNFTs...");
  await accessNFT.safeMint(deployer.address);
  console.log("✅ Minted AccessNFT #0 to deployer");

  // Create a sample trading strategy
  console.log("Creating sample trading strategy...");
  await strategyNFT.mintStrategy(
    "Conservative Yield Strategy",
    "A balanced strategy focusing on stable yields with moderate risk",
    ethers.parseEther("0.1") // 0.1 ETH price
  );
  console.log("✅ Created StrategyNFT #0");

  // Create a sample trading pool
  console.log("Creating sample trading pool...");
  await tradingPool.createPool("Community Pool", 7 * 24 * 60 * 60); // 7 days
  console.log("✅ Created TradingPool #0");

  // Create a sample challenge
  console.log("Creating sample challenge...");
  await challenge.createChallenge(
    "Weekly Trading Challenge",
    7 * 24 * 60 * 60, // 7 days
    { value: ethers.parseEther("0.5") } // 0.5 ETH reward
  );
  console.log("✅ Created Challenge #0 with 0.5 ETH reward");

  console.log("\n🎉 Deployment Complete!");
  console.log("========================================");
  console.log("Contract Addresses:");
  console.log("NexusToken:", nexusTokenAddress);
  console.log("MockAggregatorV3:", await mockAggregator.getAddress());
  console.log("AccessNFT:", await accessNFT.getAddress());
  console.log("StrategyNFT:", await strategyNFT.getAddress());
  console.log("TradingPool:", await tradingPool.getAddress());
  console.log("Challenge:", await challenge.getAddress());
  console.log("PriceFeed:", await priceFeed.getAddress());
  console.log("NexusSwap:", nexusSwapAddress);
  console.log("========================================");

  // Save deployment info for verification
  const deploymentInfo = {
    network: "sepolia",
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      MockERC20: nexusTokenAddress, // Keeping MockERC20 key for backward compatibility
      NexusToken: nexusTokenAddress,
      MockAggregatorV3: await mockAggregator.getAddress(),
      AccessNFT: await accessNFT.getAddress(),
      StrategyNFT: await strategyNFT.getAddress(),
      TradingPool: await tradingPool.getAddress(),
      Challenge: await challenge.getAddress(),
      PriceFeed: await priceFeed.getAddress(),
      NexusSwap: nexusSwapAddress,
    }
  };

  console.log("\n💾 Saving deployment info...");
  const fs = require("fs");
  fs.writeFileSync("deployment-sepolia.json", JSON.stringify(deploymentInfo, null, 2));
  console.log("✅ Deployment info saved to deployment-sepolia.json");

  console.log("\n🔍 Next steps:");
  console.log("1. Verify contracts on Etherscan: npx hardhat verify --network sepolia <CONTRACT_ADDRESS>");
  console.log("2. Test the contracts on Sepolia");
  console.log("3. Update frontend with deployed contract addresses");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });