const { ethers } = require("hardhat");

async function main() {
  console.log("💧 Starting Liquidity Pool Initialization...");

  // Configuration
  // In a real scenario, these would come from env vars or previous deployment output
  // For local testing, we'll fetch the deployed contracts if possible, or deploy mocks.
  
  // NOTE: This script assumes contracts are already deployed on the network we are running against.
  // If running on localhost, ensure `npx hardhat node` is running and `deploy-local.js` has been run.
  
  // We need to read the addresses from contracts.ts or just assume them if we are in a fresh deployment flow.
  // For this script, I will assume we are running it *after* deploy-local.js, so I'll try to read contracts.ts
  // But contracts.ts is a TS file, hard to read in JS script. 
  // I'll use hardcoded placeholders or try to find the deployments.
  
  // Better approach for this task: 
  // 1. Get the deployer account (Owner)
  // 2. Get the AccessNFT contract
  // 3. Get the NexusToken contract
  // 4. Get the NexusSwap contract
  
  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);

  // We need the addresses. Since I can't easily parse contracts.ts here without extra deps,
  // I will rely on the user providing them or just deploying fresh for this script if it were a standalone test.
  // BUT, the user wants to "initialize".
  
  // Let's try to attach to existing deployments if we can find them.
  // If not, we might need to ask the user to run deploy-local first and copy addresses.
  // OR, we can use `hardhat-deploy` if installed (doesn't look like it).
  
  // Fallback: I will assume the addresses are passed as env vars or I will try to deploy them if not found?
  // No, that's too complex.
  
  // I will create a script that *deploys* a fresh environment AND initializes liquidity, 
  // effectively a "deploy-and-seed.js" which might be more useful for the user right now.
  
  // However, the prompt asked for "Liquidity Pool Initialization".
  // Let's assume we are adding to the existing `NexusSwap`.
  
  // I'll read the addresses from the `src/lib/contracts.ts` file using regex since it's text.
  const fs = require("fs");
  const contractsPath = "src/lib/contracts.ts";
  
  if (!fs.existsSync(contractsPath)) {
    console.error("❌ contracts.ts not found. Please run deploy-local.js first.");
    return;
  }
  
  const content = fs.readFileSync(contractsPath, "utf8");
  
  // Helper to extract address
  const getAddress = (name) => {
    const match = content.match(new RegExp(`${name}: "(0x[a-fA-F0-9]{40})"`));
    return match ? match[1] : null;
  };
  
  const nexusTokenAddress = getAddress("NexusToken");
  const nexusSwapAddress = getAddress("NexusSwap");
  const accessNFTAddress = getAddress("AccessNFT"); // Might be empty in local deploy script
  
  if (!nexusTokenAddress || !nexusSwapAddress) {
    console.error("❌ Could not find contract addresses in contracts.ts");
    return;
  }
  
  console.log("NexusToken:", nexusTokenAddress);
  console.log("NexusSwap:", nexusSwapAddress);
  
  const NexusToken = await ethers.getContractAt("NexusToken", nexusTokenAddress);
  const NexusSwap = await ethers.getContractAt("NexusSwap", nexusSwapAddress);
  
  // 1. Approve Token
  const amountToAdd = ethers.parseEther("10000"); // 10k Tokens
  const ethAmount = ethers.parseEther("10"); // 10 ETH
  
  console.log("Approving NexusToken...");
  await (await NexusToken.approve(nexusSwapAddress, amountToAdd)).wait();
  
  // 2. Add Liquidity
  // NexusSwap.addLiquidity(amountA, amountB)
  // Wait, NexusSwap needs TWO tokens. 
  // If NexusSwap was deployed with (NexusToken, ZeroAddress), it might expect ETH?
  // But the restored NexusSwap code expects IERC20 for both.
  // If tokenB is ZeroAddress, the restored contract will fail on `IERC20(tokenB).transferFrom`.
  
  // CRITICAL CHECK:
  // The restored NexusSwap does NOT support ETH (native currency). It only supports ERC20/ERC20.
  // If we want ETH liquidity, we need WETH.
  // Or we need to update NexusSwap to handle ETH.
  
  // For now, I will assume we are adding liquidity for NexusToken + MockERC20 (USDC/ETH representation).
  // I'll deploy a MockERC20 to act as the pair if one isn't in the swap.
  
  // Let's check what tokenB is in the deployed NexusSwap.
  const tokenBAddress = await NexusSwap.tokenB();
  console.log("Token B in Swap:", tokenBAddress);
  
  if (tokenBAddress === ethers.ZeroAddress) {
      console.error("❌ Token B is ZeroAddress. The current NexusSwap contract does not support native ETH.");
      console.log("   You may need to redeploy NexusSwap with a WETH address or update the contract.");
      return;
  }
  
  const TokenB = await ethers.getContractAt("IERC20", tokenBAddress);
  
  // Mint/Approve Token B (assuming we can mint or have balance)
  // If it's a mock, we can mint.
  try {
      // Try to mint if it has a mint function (MockERC20)
      // If not, check balance.
      const MockToken = await ethers.getContractAt("MockERC20", tokenBAddress);
      console.log("Minting Token B (Mock)...");
      await (await MockToken.mint(deployer.address, ethAmount)).wait();
  } catch (e) {
      console.log("Could not mint Token B (might not be a mock). Checking balance...");
  }
  
  console.log("Approving Token B...");
  await (await TokenB.approve(nexusSwapAddress, ethAmount)).wait();
  
  console.log("Adding Liquidity...");
  await (await NexusSwap.addLiquidity(amountToAdd, ethAmount)).wait();
  
  console.log("✅ Liquidity Added Successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
