const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  const ACCESS_NFT_ADDRESS = "0xe97244A55B0F017B454a8170030189A649E97C91";

  console.log("🚀 Deploying Staking System with NFT Boost...");
  console.log("Deploying with account:", deployer.address);

  // 1. Deploy NexusToken (for staking)
  // console.log("📄 Deploying NexusToken...");
  // const NexusToken = await ethers.getContractFactory("NexusToken");
  // const nexusToken = await NexusToken.deploy(deployer.address, deployer.address, deployer.address);
  // await nexusToken.waitForDeployment();
  // const nexusTokenAddress = await nexusToken.getAddress();
  const nexusTokenAddress = "0x68528c7e65673164cdD0698d49F8c2552132D3A5";
  console.log("✅ NexusToken deployed to:", nexusTokenAddress);

  // 2. Deploy Staking
  console.log("🥩 Deploying Staking Contract...");
  const Staking = await ethers.getContractFactory("Staking");
  const staking = await Staking.deploy(nexusTokenAddress, ACCESS_NFT_ADDRESS);
  await staking.waitForDeployment();
  const stakingAddress = await staking.getAddress();
  console.log("✅ Staking deployed to:", stakingAddress);
  console.log("   - Linked to AccessNFT:", ACCESS_NFT_ADDRESS);
  console.log("   - Linked to NexusToken:", nexusTokenAddress);

  console.log("\nDeployment Complete! 🎉");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
