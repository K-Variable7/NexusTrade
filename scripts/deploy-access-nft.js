const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting AccessNFT (OG Pass) Deployment to Tenderly...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Configuration
  // 🚨 IMPORTANT: For Mainnet, replace these with your Gnosis Safe addresses
  // You can set them in your .env file as LIQUIDITY_WALLET and TREASURY_WALLET
  // Defaults to deployer address for testing if not set
  const liquidityWallet = process.env.LIQUIDITY_WALLET || deployer.address;
  const treasuryWallet = process.env.TREASURY_WALLET || deployer.address;

  console.log("Configuration:");
  console.log("----------------------------------------------------");
  console.log("Liquidity Wallet:", liquidityWallet);
  console.log("Treasury Wallet: ", treasuryWallet);
  console.log("----------------------------------------------------");

  // Deploy AccessNFT
  console.log("\n🎟️ Deploying AccessNFT...");
  const AccessNFT = await ethers.getContractFactory("AccessNFT");
  const accessNFT = await AccessNFT.deploy(
    deployer.address, // initialOwner
    liquidityWallet,
    treasuryWallet
  );
  await accessNFT.waitForDeployment();
  const accessNFTAddress = await accessNFT.getAddress();
  console.log("✅ AccessNFT deployed to:", accessNFTAddress);

  console.log("\nDeployment Complete! 🎉");
  console.log("----------------------------------------------------");
  console.log(`AccessNFT: ${accessNFTAddress}`);
  console.log("----------------------------------------------------");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
