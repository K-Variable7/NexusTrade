const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  const deployment = JSON.parse(fs.readFileSync("deployment-tenderly.json", "utf8"));
  const tradingPoolAddress = deployment.contracts.TradingPool;

  console.log("Creating default pool on TradingPool at:", tradingPoolAddress);

  const TradingPool = await ethers.getContractFactory("TradingPool");
  const tradingPool = TradingPool.attach(tradingPoolAddress);

  // Create "Community Pool"
  // minDeposit: 100 NEXUS
  // maxParticipants: 1000
  const tx = await tradingPool.createPool("Community Pool", ethers.parseEther("100"), 1000);
  await tx.wait();

  console.log("✅ Pool 1 created: 'Community Pool'");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
