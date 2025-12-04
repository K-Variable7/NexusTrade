const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🚀 Starting NexusTrade Deployment to Localhost...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Deploy NexusToken
  console.log("📄 Deploying NexusToken...");
  const NexusToken = await ethers.getContractFactory("NexusToken");
  const nexusToken = await NexusToken.deploy(deployer.address, deployer.address, deployer.address);
  await nexusToken.waitForDeployment();
  const nexusTokenAddress = await nexusToken.getAddress();
  console.log("✅ NexusToken deployed to:", nexusTokenAddress);

  // Deploy MockERC20 (WETH/USDC) for Liquidity Pair
  console.log("💰 Deploying MockERC20 (WETH)...");
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const mockToken = await MockERC20.deploy("Wrapped Ether", "WETH");
  await mockToken.waitForDeployment();
  const mockTokenAddress = await mockToken.getAddress();
  console.log("✅ MockERC20 deployed to:", mockTokenAddress);

  // Deploy NexusSwap
  console.log("🔄 Deploying NexusSwap...");
  const NexusSwap = await ethers.getContractFactory("NexusSwap");
  const nexusSwap = await NexusSwap.deploy(
    nexusTokenAddress,
    mockTokenAddress,
    deployer.address
  );
  await nexusSwap.waitForDeployment();
  const nexusSwapAddress = await nexusSwap.getAddress();
  console.log("✅ NexusSwap deployed to:", nexusSwapAddress);

  // Fund NexusSwap with Liquidity
  console.log("💧 Adding initial liquidity to NexusSwap...");
  const liquidityAmount = ethers.parseEther("10000");
  const ethLiquidity = ethers.parseEther("100");

  // Transfer NEXUS to NexusSwap
  await nexusToken.transfer(nexusSwapAddress, liquidityAmount);
  console.log(`   - Transferred ${ethers.formatEther(liquidityAmount)} NEXUS to Swap`);

  // Transfer ETH to NexusSwap
  await deployer.sendTransaction({
    to: nexusSwapAddress,
    value: ethLiquidity
  });
  console.log(`   - Transferred ${ethers.formatEther(ethLiquidity)} ETH to Swap`);

  // Deploy TradingPool
  console.log("🏊 Deploying TradingPool...");
  const TradingPool = await ethers.getContractFactory("TradingPool");
  const tradingPool = await TradingPool.deploy(nexusTokenAddress, deployer.address);
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

  // Create initial pool
  console.log("💧 Trading Pool deployed (Single Asset Pool)...");
  // await tradingPool.createPool("Community Pool", ethers.parseEther("100"), 100);
  console.log("✅ Initial pool ready");

  console.log("\n🎉 Deployment Complete!");
  console.log("========================================");
  console.log("Contract Addresses:");
  console.log("NexusToken:", nexusTokenAddress);
  console.log("NexusSwap:", nexusSwapAddress);
  console.log("MockERC20:", mockTokenAddress);
  console.log("TradingPool:", tradingPoolAddress);
  console.log("Challenge:", challengeAddress);
  console.log("========================================");

  // Update contracts.ts automatically
  const contractsPath = "src/lib/contracts.ts";
  let contractsContent = fs.readFileSync(contractsPath, "utf8");

  const newConfig = `  // Localhost
  localhost: {
    NexusToken: "${nexusTokenAddress}",
    NexusSwap: "${nexusSwapAddress}",
    AccessNFT: "",
    StrategyNFT: "",
    TradingPool: "${tradingPoolAddress}",
    Challenge: "${challengeAddress}",
    PriceFeed: "",
    MockERC20: "${mockTokenAddress}",
    MockAggregatorV3: "",
    Staking: "",
    Governance: ""
  }`;

  // Replace or add localhost config
  if (contractsContent.includes("localhost: {")) {
    contractsContent = contractsContent.replace(/localhost: \{[^}]+\}/s, newConfig.trim());
  } else {
    contractsContent = contractsContent.replace("export const CONTRACT_ADDRESSES = {", "export const CONTRACT_ADDRESSES = {\n" + newConfig + ",");
  }

  fs.writeFileSync(contractsPath, contractsContent);
  console.log("✅ Updated src/lib/contracts.ts with new addresses");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
