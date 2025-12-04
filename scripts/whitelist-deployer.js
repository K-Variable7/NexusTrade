const { ethers } = require("hardhat");

async function main() {
  const contractAddress = "0xe97244A55B0F017B454a8170030189A649E97C91";
  const [deployer] = await ethers.getSigners();

  console.log("🚀 Whitelisting deployer on Sepolia...");
  console.log("Contract:", contractAddress);
  console.log("Deployer:", deployer.address);

  const AccessNFT = await ethers.getContractFactory("AccessNFT");
  const contract = AccessNFT.attach(contractAddress);

  console.log("\nAdding to whitelist...");
  const tx = await contract.addToWhitelist([deployer.address]);
  console.log("Transaction sent:", tx.hash);
  
  await tx.wait();
  console.log("✅ Successfully whitelisted!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
