const { ethers } = require("hardhat");

async function main() {
  const tradingPoolAddress = "0xb8a28E13937c3fb9102c3A80ad2465D67b79b76b";
  const TradingPool = await ethers.getContractFactory("TradingPool");
  const tradingPool = TradingPool.attach(tradingPoolAddress);

  console.log("Creating pool on TradingPool at:", tradingPoolAddress);

  const tx = await tradingPool.createPool(
    "Community Pool",
    ethers.parseEther("100"), // Min deposit 100 tokens
    100 // Max participants
  );
  await tx.wait();

  console.log("Pool created! ID: 1");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
