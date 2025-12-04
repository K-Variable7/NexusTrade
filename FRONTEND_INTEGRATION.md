# Frontend Contract Integration

This guide explains how to integrate the Sepolia-deployed NexusTrade contracts into your frontend application.

## Contract Configuration

All contract addresses and ABIs are configured in `src/lib/contracts.ts`:

```typescript
import { CONTRACT_ADDRESSES, CONTRACT_ABIS, CONTRACT_CONFIGS } from '../lib/contracts';

// Get contract address for current network
const tradingPoolAddress = CONTRACT_ADDRESSES.sepolia.TradingPool;

// Get contract config for wagmi hooks
const tradingPoolConfig = CONTRACT_CONFIGS.sepolia.TradingPool;
```

## Using Wagmi Hooks

### Reading Contract Data

```typescript
import { useReadContract } from 'wagmi';
import { CONTRACT_CONFIGS } from '../lib/contracts';

function PoolCount() {
  const { data: poolCount } = useReadContract({
    ...CONTRACT_CONFIGS.sepolia.TradingPool,
    functionName: 'poolCount',
  });

  return <div>Total Pools: {poolCount?.toString()}</div>;
}
```

### Writing to Contracts

```typescript
import { useWriteContract } from 'wagmi';
import { CONTRACT_CONFIGS } from '../lib/contracts';

function CreatePool() {
  const { writeContract } = useWriteContract();

  const handleCreate = () => {
    writeContract({
      ...CONTRACT_CONFIGS.sepolia.TradingPool,
      functionName: 'createPool',
      args: ['My Pool', 604800n], // 7 days
    });
  };

  return <button onClick={handleCreate}>Create Pool</button>;
}
```

## Network Configuration

The app is configured to prioritize Sepolia testnet:

```typescript
// In providers.tsx
const config = createConfig({
  chains: [sepolia, mainnet], // Sepolia first
  // ...
});
```

## Example Components

### TradingPools Component

The `TradingPools.tsx` component demonstrates:
- Reading contract data (pool count, tax rate)
- Creating pools via contract interaction
- Joining pools with token approval flow
- Form handling with loading states

### Key Features Implemented

1. **Contract Integration**: Real contract calls for pool operations
2. **Token Approval**: Automatic ERC20 approval before joining pools
3. **Loading States**: UI feedback during transactions
4. **Error Handling**: Basic error logging and user feedback
5. **Network Awareness**: Automatic network detection and contract selection

## Testing on Sepolia

1. **Connect MetaMask** to Sepolia network
2. **Get Sepolia ETH** from faucet
3. **Get Mock Tokens**: Use the deployed MockERC20 contract
4. **Test Interactions**: Create pools, join pools, view data

## Contract Addresses (Sepolia)

```javascript
const addresses = {
  AccessNFT: "0xFd6949cDb49f6D78f7c4c17f435020e320D89217",
  StrategyNFT: "0x2fa700E279B3564C77a4D409d5A15A948eCb94fd",
  TradingPool: "0xB71Bca0D2504af5A020E5d061b29Dbbb7fFcFA1f",
  Challenge: "0xE09A5beBe6Fc7b97947e76acEfB218d9002e2F0d",
  PriceFeed: "0xcf34633d05a79c613DCbD9525a10Dd25d36dBc51",
  MockERC20: "0xbF279a2A4BE76B5BDFd75027b5eC9C52b5556922"
};
```

## Next Steps

1. **Update All Components**: Integrate contracts into remaining components
2. **Add Event Listeners**: Listen for contract events
3. **Implement Real Data**: Replace mock data with contract reads
4. **Add Transaction Confirmations**: Better UX for transactions
5. **Error Boundaries**: Handle network errors gracefully

## Development Tips

- Use the browser dev tools to inspect contract calls
- Check Etherscan for transaction details
- Test with small amounts first
- Monitor gas usage and optimize where possible

The foundation is now set for full contract integration across your DeFi platform! 🚀</content>
<parameter name="filePath">/home/fvckf/projects-one/gov-block-trade/FRONTEND_INTEGRATION.md