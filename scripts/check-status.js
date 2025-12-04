const { ethers } = require("hardhat");

async function main() {
  const address = "0x9c9BFa9207560E726bdf3577a5059dC3DDD05c94";
  const contractAddress = "0xe97244A55B0F017B454a8170030189A649E97C91";

  console.log("🔍 Checking status for:", address);

  // Check Balance
  const balance = await ethers.provider.getBalance(address);
  console.log("💰 Balance:", ethers.formatEther(balance), "ETH");

  // Check Whitelist
  const AccessNFT = await ethers.getContractFactory("AccessNFT");
  const contract = AccessNFT.attach(contractAddress);
  const isWhitelisted = await contract.whitelist(address);
  console.log("📝 Whitelisted:", isWhitelisted);
  
  // Check Mint Price
  const price = await contract.MINT_PRICE();
  console.log("🏷️ Mint Price:", ethers.formatEther(price), "ETH");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
