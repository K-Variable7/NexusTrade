# Sepolia Testnet Deployment Guide

## Prerequisites

Before deploying to Sepolia, you'll need:

1. **Sepolia ETH** - Get test ETH from [Sepolia Faucet](https://sepoliafaucet.com/)
2. **RPC URL** - Get from [Alchemy](https://www.alchemy.com/), [Infura](https://infura.io/), or another provider
3. **Private Key** - From your wallet (MetaMask, etc.)
4. **Etherscan API Key** - For contract verification

## Setup Environment Variables

1. Copy the `.env` file and update with your actual values:

```bash
# Get Sepolia RPC URL from Alchemy/Infura
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID

# Your wallet private key (NEVER share this!)
PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE

# Etherscan API key for verification
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_API_KEY
```

## Deploy to Sepolia

```bash
# Deploy all contracts
npm run deploy:sepolia

# Or run directly
npx hardhat run scripts/deploy-sepolia.js --network sepolia
```

## Verify Contracts on Etherscan

After deployment, verify your contracts:

```bash
# Verify individual contracts (replace with actual addresses)
npx hardhat verify --network sepolia 0xYourContractAddress

# Or use the deployment script output
```

## Test the Deployment

Once deployed, you can interact with the contracts using:

- **Etherscan Sepolia**: View transactions and contract interactions
- **MetaMask**: Connect to Sepolia network and interact with contracts
- **Hardhat Console**: Test contract functions

## Contract Addresses

After deployment, addresses will be saved to `deployment-sepolia.json`

## Troubleshooting

- **Insufficient Funds**: Make sure you have Sepolia ETH
- **Invalid RPC URL**: Double-check your RPC endpoint
- **Verification Failed**: Ensure Etherscan API key is correct
- **Gas Price Too Low**: Increase gas price in hardhat.config.js if needed

## Next Steps

1. Test all contract functions on Sepolia
2. Update frontend with deployed contract addresses
3. Run integration tests on testnet
4. Prepare for mainnet deployment