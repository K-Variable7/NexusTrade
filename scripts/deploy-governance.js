const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🚀 Deploying Governance Contract...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const Governance = await ethers.getContractFactory("Governance");
  const governance = await Governance.deploy();
  await governance.waitForDeployment();
  const governanceAddress = await governance.getAddress();
  console.log("✅ Governance deployed to:", governanceAddress);

  // Update deployment info
  let deploymentInfo;
  try {
    deploymentInfo = JSON.parse(fs.readFileSync("deployment-tenderly.json", "utf8"));
  } catch (error) {
    console.log("Creating new deployment info file...");
    deploymentInfo = { contracts: {} };
  }

  deploymentInfo.contracts.Governance = governanceAddress;
  fs.writeFileSync("deployment-tenderly.json", JSON.stringify(deploymentInfo, null, 2));
  console.log("✅ Deployment info updated.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
