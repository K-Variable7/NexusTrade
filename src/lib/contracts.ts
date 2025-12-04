// Contract configurations for NexusTrade DeFi Platform
// Sepolia Testnet Deployment - December 3, 2025

export const CONTRACT_ADDRESSES = {
  // Sepolia Testnet
  sepolia: {
    AccessNFT: "0xe97244A55B0F017B454a8170030189A649E97C91",
    StrategyNFT: "0x2fa700E279B3564C77a4D409d5A15A948eCb94fd",
    TradingPool: "0xB71Bca0D2504af5A020E5d061b29Dbbb7fFcFA1f",
    Challenge: "0xE09A5beBe6Fc7b97947e76acEfB218d9002e2F0d",
    PriceFeed: "0xcf34633d05a79c613DCbD9525a10Dd25d36dBc51",
    MockERC20: "0xbF279a2A4BE76B5BDFd75027b5eC9C52b5556922",
    MockAggregatorV3: "0x7F921608DD0Cf2Ec8C29f31FB1b4A38E4f9A204C",
    NexusToken: "0x68528c7e65673164cdD0698d49F8c2552132D3A5",
    Staking: "",
    NexusSwap: "",
    Governance: ""
  },
    // Tenderly Virtual Testnet
  tenderly: {
    NexusToken: "0xF9322a90E3F7591E27dafB60FaB952201DD31a13",
    NexusSwap: "0xd229e939cfDa3df72E384ADc199c26BC0C134a80",
    AccessNFT: "",
    StrategyNFT: "",
    TradingPool: "0xc57C3EA374b8bF6D31AF143CEb5a9BF16890EA2E",
    Challenge: "0x1f484b8a19762D4A25BD8735c560F37C7633dB54",
    Staking: "0xd943F377306b5A2363037743e0DB3970efB0A3C5",
    Governance: "0xe5606f9c0D0F74cbEb9C54D72dd6f406247e7049",
    PriceFeed: "",
    MockERC20: "", // Not needed on mainnet
    MockAggregatorV3: "" // Not needed on mainnet
  },
  // Localhost
  // Localhost
  // Localhost
  // Localhost
  localhost: {
    NexusToken: "0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0",
    NexusSwap: "0x9A676e781A523b5d0C0e43731313A708CB607508",
    AccessNFT: "",
    StrategyNFT: "",
    TradingPool: "0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE",
    Challenge: "0x68B1D87F95878fE05B998F19b66F4baba5De1aed",
    PriceFeed: "",
    MockERC20: "0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82",
    MockAggregatorV3: "",
    Staking: "",
    Governance: ""
  },
  // Mainnet (to be updated when deployed)
  mainnet: {
    AccessNFT: "",
    StrategyNFT: "",
    TradingPool: "",
    Challenge: "",
    PriceFeed: "",
    MockERC20: "", // Not needed on mainnet
    MockAggregatorV3: "", // Not needed on mainnet
    NexusToken: "",
    NexusSwap: "",
    Staking: "",
    Governance: ""
  }
} as const;

// Contract ABIs (imported from artifacts)
import AccessNFTABI from "../../artifacts/contracts/AccessNFT.sol/AccessNFT.json";
import StrategyNFTABI from "../../artifacts/contracts/StrategyNFT.sol/StrategyNFT.json";
import TradingPoolABI from "../../artifacts/contracts/TradingPool.sol/TradingPool.json";
import ChallengeABI from "../../artifacts/contracts/Challenge.sol/Challenge.json";
import PriceFeedABI from "../../artifacts/contracts/PriceFeed.sol/PriceFeed.json";
import MockERC20ABI from "../../artifacts/contracts/MockERC20.sol/MockERC20.json";
import NexusTokenABI from "../../artifacts/contracts/NexusToken.sol/NexusToken.json";
import NexusSwapABI from "../../artifacts/contracts/NexusSwap.sol/NexusSwap.json";
import MockAggregatorV3ABI from "../../artifacts/contracts/MockAggregatorV3.sol/MockAggregatorV3.json";
import StakingABI from "../../artifacts/contracts/Staking.sol/Staking.json";
import GovernanceABI from "../../artifacts/contracts/Governance.sol/Governance.json";

export const CONTRACT_ABIS = {
  AccessNFT: AccessNFTABI.abi as any,
  StrategyNFT: StrategyNFTABI.abi as any,
  TradingPool: TradingPoolABI.abi as any,
  Challenge: ChallengeABI.abi as any,
  PriceFeed: PriceFeedABI.abi as any,
  MockERC20: MockERC20ABI.abi as any,
  NexusToken: NexusTokenABI.abi as any,
  NexusSwap: NexusSwapABI.abi as any,
  MockAggregatorV3: MockAggregatorV3ABI.abi as any,
  Staking: StakingABI.abi as any,
  Governance: GovernanceABI.abi as any
} as const;

// Contract configurations for wagmi hooks
export const CONTRACT_CONFIGS = {
  sepolia: {
    AccessNFT: {
      address: CONTRACT_ADDRESSES.sepolia.AccessNFT as `0x${string}`,
      abi: CONTRACT_ABIS.AccessNFT
    },
    StrategyNFT: {
      address: CONTRACT_ADDRESSES.sepolia.StrategyNFT as `0x${string}`,
      abi: CONTRACT_ABIS.StrategyNFT
    },
    TradingPool: {
      address: CONTRACT_ADDRESSES.sepolia.TradingPool as `0x${string}`,
      abi: CONTRACT_ABIS.TradingPool
    },
    Challenge: {
      address: CONTRACT_ADDRESSES.sepolia.Challenge as `0x${string}`,
      abi: CONTRACT_ABIS.Challenge
    },
    PriceFeed: {
      address: CONTRACT_ADDRESSES.sepolia.PriceFeed as `0x${string}`,
      abi: CONTRACT_ABIS.PriceFeed
    },
    MockERC20: {
      address: CONTRACT_ADDRESSES.sepolia.MockERC20 as `0x${string}`,
      abi: CONTRACT_ABIS.MockERC20
    },
    MockAggregatorV3: {
      address: CONTRACT_ADDRESSES.sepolia.MockAggregatorV3 as `0x${string}`,
      abi: CONTRACT_ABIS.MockAggregatorV3
    },
    Staking: {
      address: CONTRACT_ADDRESSES.sepolia.Staking as `0x${string}`,
      abi: CONTRACT_ABIS.Staking
    },
    NexusToken: {
      address: CONTRACT_ADDRESSES.sepolia.NexusToken as `0x${string}`,
      abi: CONTRACT_ABIS.NexusToken
    }
  },
  tenderly: {
    NexusToken: {
      address: CONTRACT_ADDRESSES.tenderly.NexusToken as `0x${string}`,
      abi: CONTRACT_ABIS.NexusToken
    },
    NexusSwap: {
      address: CONTRACT_ADDRESSES.tenderly.NexusSwap as `0x${string}`,
      abi: CONTRACT_ABIS.NexusSwap
    },
    AccessNFT: {
      address: CONTRACT_ADDRESSES.tenderly.AccessNFT as `0x${string}`,
      abi: CONTRACT_ABIS.AccessNFT
    },
    StrategyNFT: {
      address: CONTRACT_ADDRESSES.tenderly.StrategyNFT as `0x${string}`,
      abi: CONTRACT_ABIS.StrategyNFT
    },
    TradingPool: {
      address: CONTRACT_ADDRESSES.tenderly.TradingPool as `0x${string}`,
      abi: CONTRACT_ABIS.TradingPool
    },
    Challenge: {
      address: CONTRACT_ADDRESSES.tenderly.Challenge as `0x${string}`,
      abi: CONTRACT_ABIS.Challenge
    },
    Staking: {
      address: CONTRACT_ADDRESSES.tenderly.Staking as `0x${string}`,
      abi: CONTRACT_ABIS.Staking
    },
    Governance: {
      address: CONTRACT_ADDRESSES.tenderly.Governance as `0x${string}`,
      abi: CONTRACT_ABIS.Governance
    },
    PriceFeed: {
      address: CONTRACT_ADDRESSES.tenderly.PriceFeed as `0x${string}`,
      abi: CONTRACT_ABIS.PriceFeed
    },
    MockERC20: {
      address: CONTRACT_ADDRESSES.tenderly.NexusToken as `0x${string}`,
      abi: CONTRACT_ABIS.MockERC20
    },
    MockAggregatorV3: {
      address: CONTRACT_ADDRESSES.tenderly.MockAggregatorV3 as `0x${string}`,
      abi: CONTRACT_ABIS.MockAggregatorV3
    }
  },
  // Localhost
  localhost: {
    NexusToken: {
      address: (CONTRACT_ADDRESSES as any).localhost?.NexusToken as `0x${string}`,
      abi: CONTRACT_ABIS.NexusToken
    },
    NexusSwap: {
      address: (CONTRACT_ADDRESSES as any).localhost?.NexusSwap as `0x${string}`,
      abi: CONTRACT_ABIS.NexusSwap
    },
    AccessNFT: {
      address: (CONTRACT_ADDRESSES as any).localhost?.AccessNFT as `0x${string}`,
      abi: CONTRACT_ABIS.AccessNFT
    },
    StrategyNFT: {
      address: (CONTRACT_ADDRESSES as any).localhost?.StrategyNFT as `0x${string}`,
      abi: CONTRACT_ABIS.StrategyNFT
    },
    TradingPool: {
      address: (CONTRACT_ADDRESSES as any).localhost?.TradingPool as `0x${string}`,
      abi: CONTRACT_ABIS.TradingPool
    },
    Challenge: {
      address: (CONTRACT_ADDRESSES as any).localhost?.Challenge as `0x${string}`,
      abi: CONTRACT_ABIS.Challenge
    },
    PriceFeed: {
      address: (CONTRACT_ADDRESSES as any).localhost?.PriceFeed as `0x${string}`,
      abi: CONTRACT_ABIS.PriceFeed
    },
    MockERC20: {
      address: (CONTRACT_ADDRESSES as any).localhost?.MockERC20 as `0x${string}`,
      abi: CONTRACT_ABIS.MockERC20
    },
    MockAggregatorV3: {
      address: (CONTRACT_ADDRESSES as any).localhost?.MockAggregatorV3 as `0x${string}`,
      abi: CONTRACT_ABIS.MockAggregatorV3
    }
  },
  mainnet: {
    AccessNFT: {
      address: CONTRACT_ADDRESSES.mainnet.AccessNFT as `0x${string}`,
      abi: CONTRACT_ABIS.AccessNFT
    },
    StrategyNFT: {
      address: CONTRACT_ADDRESSES.mainnet.StrategyNFT as `0x${string}`,
      abi: CONTRACT_ABIS.StrategyNFT
    },
    TradingPool: {
      address: CONTRACT_ADDRESSES.mainnet.TradingPool as `0x${string}`,
      abi: CONTRACT_ABIS.TradingPool
    },
    Challenge: {
      address: CONTRACT_ADDRESSES.mainnet.Challenge as `0x${string}`,
      abi: CONTRACT_ABIS.Challenge
    },
    PriceFeed: {
      address: CONTRACT_ADDRESSES.mainnet.PriceFeed as `0x${string}`,
      abi: CONTRACT_ABIS.PriceFeed
    }
  }
} as const;

// Utility functions
export function getContractAddress(chainId: number, contractName: keyof typeof CONTRACT_ADDRESSES.sepolia) {
  const networkName = chainId === 11155111 ? 'sepolia' : 'mainnet';
  return CONTRACT_ADDRESSES[networkName][contractName];
}

export function getContractConfig(chainId: number, contractName: keyof typeof CONTRACT_CONFIGS.sepolia) {
  const networkName = chainId === 31337 ? 'localhost' : chainId === 111545111 ? 'tenderly' : chainId === 11155111 ? 'sepolia' : 'mainnet';

  // For mainnet, only allow contracts that exist on mainnet
  if (networkName === 'mainnet' && (contractName === 'MockERC20' || contractName === 'MockAggregatorV3')) {
    return undefined;
  }

  // Handle localhost case if not yet in CONTRACT_CONFIGS (will be added by script)
  if (networkName === 'localhost' && !(CONTRACT_CONFIGS as any).localhost) {
    return undefined;
  }

  return (CONTRACT_CONFIGS as any)[networkName]?.[contractName];
}

// Chain configurations
export const SUPPORTED_CHAINS = {
  sepolia: {
    id: 11155111,
    name: 'Sepolia',
    network: 'sepolia',
    nativeCurrency: {
      name: 'Sepolia Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: ['https://rpc.sepolia.org'],
      },
      public: {
        http: ['https://rpc.sepolia.org'],
      },
    },
    blockExplorers: {
      default: {
        name: 'Etherscan',
        url: 'https://sepolia.etherscan.io',
      },
    },
    contracts: CONTRACT_CONFIGS.sepolia,
  },
  mainnet: {
    id: 1,
    name: 'Ethereum',
    network: 'mainnet',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: ['https://cloudflare-eth.com'],
      },
      public: {
        http: ['https://cloudflare-eth.com'],
      },
    },
    blockExplorers: {
      default: {
        name: 'Etherscan',
        url: 'https://etherscan.io',
      },
    },
    contracts: CONTRACT_CONFIGS.mainnet,
  },
} as const;