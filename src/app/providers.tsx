'use client';

import { WagmiProvider, createConfig } from 'wagmi';
import { metaMask } from 'wagmi/connectors';
import { http } from 'viem';
import { mainnet, sepolia, localhost } from 'viem/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Define Tenderly chain (Sepolia fork)
const tenderly = {
  id: 111545111, // Tenderly's assigned chain ID
  name: 'Tenderly Sepolia Fork',
  network: 'tenderly-sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_TENDERLY_RPC_URL || 'https://virtual.sepolia.eu.rpc.tenderly.co/c5c50ec2-ea49-4b26-a032-820cdddcc397'] },
    public: { http: [process.env.NEXT_PUBLIC_TENDERLY_RPC_URL || 'https://virtual.sepolia.eu.rpc.tenderly.co/c5c50ec2-ea49-4b26-a032-820cdddcc397'] },
  },
  blockExplorers: {
    default: { name: 'Tenderly', url: 'https://dashboard.tenderly.co' },
  },
  testnet: true,
};

const queryClient = new QueryClient();

const config = createConfig({
  chains: [localhost, tenderly, sepolia, mainnet], // Localhost first for testing
  connectors: [
    metaMask({
      dappMetadata: {
        name: 'NexusTrade DeFi',
        url: 'http://localhost:3000',
        iconUrl: 'http://localhost:3000/favicon.ico',
      },
    }),
    // walletConnect({ projectId: 'your-project-id' }), // Temporarily disabled
  ],
  transports: {
    [localhost.id]: http(),
    [tenderly.id]: http(process.env.NEXT_PUBLIC_TENDERLY_RPC_URL || 'https://virtual.sepolia.eu.rpc.tenderly.co/c5c50ec2-ea49-4b26-a032-820cdddcc397'),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  ssr: true, // Enable SSR support
});

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>{children}</WagmiProvider>
    </QueryClientProvider>
  );
}