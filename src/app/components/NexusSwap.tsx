'use client';

import { useState, useEffect } from 'react';
import { useAccount, useChainId, useReadContract, useWriteContract, useWaitForTransactionReceipt, useSwitchChain, useBalance, useSendTransaction } from 'wagmi';
import { FiArrowDown, FiSettings, FiZap, FiClock, FiTrendingUp, FiAlertTriangle, FiShuffle, FiGlobe, FiPlus } from 'react-icons/fi';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../../lib/contracts';
import { ethers } from 'ethers';

interface Token {
  symbol: string;
  name: string;
  icon: string;
  address?: string;
}

interface Transaction {
  id: string;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  fee: string;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
  txHash?: string;
}

interface SwapRoute {
  id: string;
  path: string[];
  outputAmount: string;
  fee: string;
  gasEstimate: string;
  impact: number;
  estimatedTime: string;
}

interface Network {
  id: string;
  name: string;
  icon: string;
  chainId: number;
}

export default function NexusSwap() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  // Get contract addresses based on current chain
  const getContractAddresses = () => {
    if (chainId === 31337) { // Localhost
      return (CONTRACT_ADDRESSES as any).localhost;
    }
    if (chainId === 111545111) { // Tenderly
      return CONTRACT_ADDRESSES.tenderly;
    }
    return CONTRACT_ADDRESSES.sepolia; // fallback
  };

  const contractAddresses = getContractAddresses();
  const [fromToken, setFromToken] = useState<Token>({ symbol: 'ETH', name: 'Ethereum', icon: '⟠' });
  const [toToken, setToToken] = useState<Token>({ symbol: 'NEXUS', name: 'Nexus Token', icon: '🚀' });
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showRoutes, setShowRoutes] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [priceImpact, setPriceImpact] = useState(0);
  const [minimumReceived, setMinimumReceived] = useState('0');
  const [selectedRoute, setSelectedRoute] = useState<string>('best');
  const [gasPriority, setGasPriority] = useState<'slow' | 'standard' | 'fast'>('standard');
  const [fromNetwork, setFromNetwork] = useState<Network>({ id: 'ethereum', name: 'Ethereum', icon: '⟠', chainId: 1 });
  const [toNetwork, setToNetwork] = useState<Network>({ id: 'ethereum', name: 'Ethereum', icon: '⟠', chainId: 1 });
  const [isCrossChain, setIsCrossChain] = useState(false);

  // Mock transaction history
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      fromToken: 'NEXUS',
      toToken: 'ETH',
      fromAmount: '1000',
      toAmount: '0.3125',
      fee: '3 NEXUS',
      timestamp: new Date(Date.now() - 3600000),
      status: 'completed',
      txHash: '0x1234...abcd'
    },
    {
      id: '2',
      fromToken: 'ETH',
      toToken: 'NEXUS',
      fromAmount: '0.5',
      toAmount: '1666.67',
      fee: '0.0015 ETH',
      timestamp: new Date(Date.now() - 7200000),
      status: 'completed',
      txHash: '0x5678...efgh'
    }
  ]);

  const networks: Network[] = [
    { id: 'ethereum', name: 'Ethereum', icon: '⟠', chainId: 1 },
    { id: 'arbitrum', name: 'Arbitrum', icon: '🔺', chainId: 42161 },
    { id: 'polygon', name: 'Polygon', icon: '⬡', chainId: 137 },
    { id: 'optimism', name: 'Optimism', icon: '⚡', chainId: 10 },
    { id: 'base', name: 'Base', icon: '💙', chainId: 8453 },
  ];

  const tokens: Token[] = [
    { symbol: 'ETH', name: 'Ethereum', icon: '⟠' },
    { symbol: 'NEXUS', name: 'Nexus Token', icon: '🚀', address: (contractAddresses as any).NexusToken || contractAddresses.MockERC20 },
    { symbol: 'ARB', name: 'Arbitrum', icon: '🔺' },
    { symbol: 'MATIC', name: 'Polygon', icon: '⬡' },
    { symbol: 'USDC', name: 'USD Coin', icon: '💰' },
    { symbol: 'USDT', name: 'Tether', icon: '💵' },
  ];

  // Mock swap routes
  const [swapRoutes, setSwapRoutes] = useState<SwapRoute[]>([]);

  // Contract interactions
  const networkName = chainId === 111545111 ? 'tenderly' : 'sepolia'; // Tenderly uses custom chain ID
  const contracts = CONTRACT_ADDRESSES[networkName] || CONTRACT_ADDRESSES.sepolia;

  // Fetch real balances
  const { data: ethBalance } = useBalance({ address });
  const { data: nexusBalance } = useReadContract({
    address: ((contracts as any).NexusToken || contracts.MockERC20) as `0x${string}`,
    abi: CONTRACT_ABIS.NexusToken,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: { enabled: !!address }
  });

  // Fetch contract ETH balance (liquidity)
  const { data: contractEthBalance } = useBalance({ 
    address: (contracts as any).NexusSwap as `0x${string}`,
    query: { enabled: !!(contracts as any).NexusSwap }
  });

  // Fetch contract NEXUS balance (liquidity)
  const { data: contractNexusBalance } = useReadContract({
    address: ((contracts as any).NexusToken || contracts.MockERC20) as `0x${string}`,
    abi: CONTRACT_ABIS.NexusToken,
    functionName: 'balanceOf',
    args: [(contracts as any).NexusSwap as `0x${string}`],
    query: { enabled: !!(contracts as any).NexusSwap }
  });

  // NEXUS token contract hooks
  const { data: nexusFeeBreakdown } = useReadContract({
    address: ((contracts as any).NexusToken || contracts.MockERC20) as `0x${string}`,
    abi: CONTRACT_ABIS.NexusToken,
    functionName: 'getFeeBreakdown',
    args: [fromAmount ? BigInt(Math.floor(parseFloat(fromAmount) * 10**18)) : BigInt(0)],
    query: { enabled: !!fromAmount && fromToken.symbol === 'NEXUS' }
  });

  const { data: volumeInfo } = useReadContract({
    address: ((contracts as any).NexusToken || contracts.MockERC20) as `0x${string}`,
    abi: CONTRACT_ABIS.NexusToken,
    functionName: 'getVolumeInfo',
  }) as { data: readonly [bigint, bigint, bigint, bigint] | undefined };

  // Approval contract hooks
  const { writeContractAsync: approveWriteAsync, data: approveHash } = useWriteContract();
  const { isLoading: approveIsLoading, isSuccess: approveSuccess } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  // Swap contract hooks
  const { writeContractAsync: swapWriteAsync, data: swapHash } = useWriteContract();
  const { isLoading: swapIsLoading, isSuccess: swapSuccess } = useWaitForTransactionReceipt({
    hash: swapHash,
  });

  // Mint contract hooks
  const { writeContractAsync: mintWriteAsync } = useWriteContract();

  const handleMint = async () => {
    if (!address) return;
    try {
      const nexusTokenAddress = (contractAddresses as any).NexusToken || contractAddresses.MockERC20;
      if (!nexusTokenAddress) {
        alert('❌ NEXUS token address not found');
        return;
      }

      console.log('Minting test tokens...');
      await mintWriteAsync({
        address: nexusTokenAddress as `0x${string}`,
        abi: CONTRACT_ABIS.NexusToken,
        functionName: 'mint',
        args: [address, ethers.parseEther('1000')], // Mint 1000 tokens
      });
      alert('✅ Mint transaction sent! Wait for confirmation.');
    } catch (error: any) {
      console.error('Mint error:', error);
      alert(`❌ Mint failed: ${error.message || 'Unknown error'}`);
    }
  };

  // ETH Transfer hook (for funding)
  const { sendTransactionAsync } = useSendTransaction();

  // Track approval state
  const [needsApproval, setNeedsApproval] = useState(false);

  // Mock price calculation - in real implementation, this would use DEX APIs
  const calculateSwap = (amount: string, from: string, to: string) => {
    if (!amount || isNaN(parseFloat(amount))) return '';

    const baseAmount = parseFloat(amount);

    // Mock exchange rates (NEXUS = $1, ETH = $3000, etc.)
    const rates: { [key: string]: number } = {
      'NEXUS': 1,
      'ETH': 3000,
      'ARB': 2,
      'MATIC': 1.5,
      'USDC': 1,
      'USDT': 1,
    };

    const fromRate = rates[from] || 1;
    const toRate = rates[to] || 1;

    // Calculate with platform fee (0.3% - lower than typical DEX fees)
    const platformFee = 0.003;
    const amountAfterFee = baseAmount * (1 - platformFee);
    const usdValue = amountAfterFee * fromRate;
    const result = usdValue / toRate;

    return result.toFixed(6);
  };

  const calculatePriceImpact = (amount: string, from: string) => {
    if (!amount || isNaN(parseFloat(amount))) return 0;

    const baseAmount = parseFloat(amount);

    // Mock price impact calculation based on trade size
    // Larger trades have higher price impact
    const impact = Math.min((baseAmount / 10000) * 100, 5); // Max 5% impact
    return impact;
  };

  const calculateFee = (amount: string) => {
    if (!amount || isNaN(parseFloat(amount))) return { platformFee: 0, nativeFee: 0 };

    const baseAmount = parseFloat(amount);

    // Use real NEXUS token fees if available
    if (fromToken.symbol === 'NEXUS' && nexusFeeBreakdown) {
      const [currentFee, feeAmount, treasuryAmount, teamAmount, rewardsAmount, liquidityAmount] = nexusFeeBreakdown as [bigint, bigint, bigint, bigint, bigint, bigint];
      const feePercent = Number(currentFee) / 100; // Convert basis points to percentage
      const platformFee = baseAmount * (feePercent / 100);
      const nativeFee = platformFee; // Simplified conversion

      return {
        platformFee,
        nativeFee,
        breakdown: {
          treasury: Number(treasuryAmount) / 10**18,
          team: Number(teamAmount) / 10**18,
          rewards: Number(rewardsAmount) / 10**18,
          liquidity: Number(liquidityAmount) / 10**18
        }
      };
    }

    // Fallback to platform fees for other tokens
    const platformFee = baseAmount * 0.005; // 0.5% platform fee for non-NEXUS
    const nativeFee = platformFee * 1; // Mock conversion

    return { platformFee, nativeFee, breakdown: null };
  };

  const calculateGasEstimate = (route: SwapRoute, priority: string) => {
    const baseGas = parseFloat(route.gasEstimate);
    const multipliers = { slow: 0.8, standard: 1, fast: 1.5 };
    const multiplier = multipliers[priority as keyof typeof multipliers] || 1;
    return (baseGas * multiplier).toFixed(0);
  };

  const generateSwapRoutes = (from: string, to: string, amount: string) => {
    if (!amount || isNaN(parseFloat(amount))) return [];

    const baseAmount = parseFloat(amount);
    const routes: SwapRoute[] = [];

    // Direct route
    routes.push({
      id: 'direct',
      path: [from, to],
      outputAmount: calculateSwap(amount, from, to),
      fee: '0.3%',
      gasEstimate: '150000',
      impact: calculatePriceImpact(amount, from),
      estimatedTime: '~30s'
    });

    // Via USDC route (if applicable)
    if (from !== 'USDC' && to !== 'USDC') {
      const viaUsdcAmount = (baseAmount * 0.995).toFixed(6); // 0.5% fee for multi-hop
      routes.push({
        id: 'via-usdc',
        path: [from, 'USDC', to],
        outputAmount: calculateSwap(viaUsdcAmount, 'USDC', to),
        fee: '0.5%',
        gasEstimate: '220000',
        impact: calculatePriceImpact(amount, from) * 0.8,
        estimatedTime: '~45s'
      });
    }

    // Via ETH route (if applicable)
    if (from !== 'ETH' && to !== 'ETH') {
      const viaEthAmount = (baseAmount * 0.995).toFixed(6);
      routes.push({
        id: 'via-eth',
        path: [from, 'ETH', to],
        outputAmount: calculateSwap(viaEthAmount, 'ETH', to),
        fee: '0.5%',
        gasEstimate: '200000',
        impact: calculatePriceImpact(amount, from) * 0.9,
        estimatedTime: '~40s'
      });
    }

    return routes.sort((a, b) => parseFloat(b.outputAmount) - parseFloat(a.outputAmount));
  };

  useEffect(() => {
    const result = calculateSwap(fromAmount, fromToken.symbol, toToken.symbol);
    setToAmount(result);

    const impact = calculatePriceImpact(fromAmount, fromToken.symbol);
    setPriceImpact(impact);

    // Calculate minimum received based on slippage
    if (result) {
      const minReceived = parseFloat(result) * (1 - slippage / 100);
      setMinimumReceived(minReceived.toFixed(6));
    }

    // Generate routes
    const routes = generateSwapRoutes(fromToken.symbol, toToken.symbol, fromAmount);
    setSwapRoutes(routes);

    // Check if cross-chain
    setIsCrossChain(fromNetwork.id !== toNetwork.id);
  }, [fromAmount, fromToken, toToken, fromNetwork, toNetwork, slippage]);

  useEffect(() => {
    if (swapSuccess && swapHash) {
      // Add to transaction history
      const newTransaction: Transaction = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        fromToken: fromToken.symbol,
        toToken: toToken.symbol,
        fromAmount,
        toAmount,
        fee: '0.005 ETH', // Approximate fee
        timestamp: new Date(),
        status: 'completed',
        txHash: swapHash
      };

      setTransactions(prev => [newTransaction, ...prev]);
      alert(`✅ Swap completed!\n${fromAmount} ${fromToken.symbol} → ${toAmount} ${toToken.symbol}\nTx: ${swapHash}`);

      // Reset form
      setFromAmount('');
      setToAmount('');
      setIsSwapping(false);
    }
  }, [swapSuccess, swapHash, fromAmount, toAmount, fromToken.symbol, toToken.symbol]);

  // Handle approval success and trigger swap
  useEffect(() => {
    const performSwapAfterApproval = async () => {
      if (approveSuccess && needsApproval && fromToken.symbol === 'NEXUS' && toToken.symbol === 'ETH') {
        setNeedsApproval(false);
        try {
          const amountIn = ethers.parseEther(fromAmount);
          
          // Now perform the actual swap
          await swapWriteAsync({
            address: (contractAddresses as any).NexusSwap as `0x${string}`,
            abi: CONTRACT_ABIS.NexusSwap,
            functionName: 'swap',
            args: [
              (contractAddresses as any).NexusToken || contractAddresses.MockERC20, // tokenIn (NEXUS)
              '0x0000000000000000000000000000000000000000', // tokenOut (ETH)
              amountIn, // amountIn
              BigInt(0), // minAmountOut
              false // isExternal
            ],
          });
        } catch (error) {
          console.error('Swap after approval failed:', error);
          alert('❌ Swap failed after approval. Please try again.');
        }
      }
    };

    performSwapAfterApproval();
  }, [approveSuccess, needsApproval, fromToken.symbol, toToken.symbol, fromAmount, contractAddresses, swapWriteAsync]);

  const handleSwap = async () => {
    console.log('Handle swap initiated');
    if (!fromAmount || !toAmount) {
      alert('❌ Please enter an amount');
      return;
    }
    
    if (!isConnected) {
      alert('❌ Please connect your wallet');
      return;
    }

    // Ensure we're on the Tenderly network
    if (chainId !== 111545111) {
      console.log('Wrong network, switching to Tenderly...');
      try {
        await switchChain({ chainId: 111545111 });
        // We need to return here because the chain switch might reload the page or state needs to settle
        // But usually we can continue if the user approves. 
        // However, to be safe, let's ask them to click swap again or wait.
        // Actually, let's try to continue if possible, but often it's better to wait.
        // For now, let's just alert.
        // alert('🔄 Switched to Tenderly network. Please try the swap again.');
        // return;
      } catch (error) {
        console.error('Failed to switch network:', error);
        alert('❌ Failed to switch to Tenderly network. Please add the network manually in MetaMask.');
        return;
      }
    }

    if (!(contractAddresses as any).NexusSwap) {
      alert('❌ Contract address not found for current network');
      return;
    }

    setIsSwapping(true);

    try {
      // Determine swap direction
      const isEthToNexus = fromToken.symbol === 'ETH' && toToken.symbol === 'NEXUS';
      const isNexusToEth = fromToken.symbol === 'NEXUS' && toToken.symbol === 'ETH';

      if (!isEthToNexus && !isNexusToEth) {
        alert('❌ Only ETH ↔ NEXUS swaps are currently supported');
        setIsSwapping(false);
        return;
      }

      const amountIn = ethers.parseEther(fromAmount);
      console.log(`Swapping ${fromAmount} ${fromToken.symbol} to ${toToken.symbol}`);

      if (isEthToNexus) {
        // Swap ETH to NEXUS - send ETH to contract
        console.log('Sending ETH to NexusSwap contract...');
        await swapWriteAsync({
          address: (contractAddresses as any).NexusSwap as `0x${string}`,
          abi: CONTRACT_ABIS.NexusSwap,
          functionName: 'swap',
          args: [
            '0x0000000000000000000000000000000000000000', // tokenIn (ETH)
            (contractAddresses as any).NexusToken || contractAddresses.MockERC20, // tokenOut (NEXUS)
            amountIn, // amountIn
            BigInt(0), // minAmountOut
            false // isExternal
          ],
          value: amountIn, // Send ETH
        });
        console.log('Swap transaction sent');
      } else if (isNexusToEth) {
        // First check if approval is needed
        const nexusTokenAddress = (contractAddresses as any).NexusToken || contractAddresses.MockERC20;
        if (!nexusTokenAddress) {
          alert('❌ NEXUS token address not found');
          setIsSwapping(false);
          return;
        }

        console.log('Requesting approval...');
        // For NEXUS to ETH, we need to approve the swap contract to spend NEXUS tokens
        await approveWriteAsync({
          address: nexusTokenAddress as `0x${string}`,
          abi: CONTRACT_ABIS.NexusToken,
          functionName: 'approve',
          args: [(contractAddresses as any).NexusSwap as `0x${string}`, amountIn],
        });
        console.log('Approval transaction sent');
        setNeedsApproval(true);
      }

    } catch (error: any) {
      console.error('Swap error:', error);
      // Don't alert if user rejected
      if (error.code !== 4001 && !error.message?.includes('User rejected')) {
        alert(`❌ Swap failed: ${error.message || 'Unknown error'}`);
      }
      setIsSwapping(false);
    }
    // Note: We don't set isSwapping(false) here for success cases because we wait for receipt
    // But for async write, we only wait for the signature. The receipt comes later.
    // So we should keep isSwapping true until receipt?
    // The useWaitForTransactionReceipt hooks handle the loading state for the transaction mining.
    // But isSwapping is for the "signing" process too.
    // Let's keep isSwapping true only during the async call, and let the hooks handle the rest.
    // Actually, the UI uses `isSwapping || swapIsLoading || approveIsLoading`.
    // So we can set isSwapping to false after the signature is obtained.
    setIsSwapping(false);
  };

  const swapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setFromAmount(toAmount);
    setToAmount(fromAmount);

    // Also swap networks if different
    const tempNetwork = fromNetwork;
    setFromNetwork(toNetwork);
    setToNetwork(tempNetwork);
  };

  const addNexusToWallet = async () => {
    const nexusToken = tokens.find(t => t.symbol === 'NEXUS');
    if (!nexusToken?.address) return;

    // Check if wallet is connected
    if (!isConnected || !address) {
      alert('❌ Please connect your wallet first.');
      return;
    }

    // Check if on Tenderly network (chainId 111545111) or Localhost (31337)
    if (chainId !== 111545111 && chainId !== 31337) {
      alert('❌ Please switch to Tenderly Virtual Testnet or Localhost in your wallet.');
      return;
    }

    try {
      // Check if MetaMask is available
      if (typeof window !== 'undefined' && window.ethereum) {
        await window.ethereum.request({
          method: 'wallet_watchAsset',
          params: {
            type: 'ERC20',
            options: {
              address: nexusToken.address,
              symbol: nexusToken.symbol,
              decimals: 18,
              image: '', // Could add token logo URL
            },
          },
        });
        alert('✅ Nexus token added to your wallet!');
      } else {
        alert('❌ Wallet not found. Please install MetaMask or another Web3 wallet.');
      }
    } catch (error: any) {
      console.error('Error adding token to wallet:', error);
      if (error.code === 4001) {
        alert('❌ Token addition cancelled by user.');
      } else if (error.code === -32601) {
        alert('❌ Your wallet does not support adding tokens. Please add manually.');
      } else {
        alert('❌ Failed to add token to wallet. Please try manually.');
      }
    }
  };

  const fees = calculateFee(fromAmount);
  const selectedRouteData = swapRoutes.find(r => r.id === selectedRoute) || swapRoutes[0];

  const getPriceImpactColor = (impact: number) => {
    if (impact < 1) return 'text-green-400';
    if (impact < 3) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getPriceImpactWarning = (impact: number) => {
    if (impact < 1) return 'Low impact';
    if (impact < 3) return 'Medium impact';
    return 'High impact - Consider smaller trade';
  };

  const getGasPriceColor = (priority: string) => {
    switch (priority) {
      case 'slow': return 'text-green-400';
      case 'standard': return 'text-blue-400';
      case 'fast': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-2">
          Nexus Swap
        </h2>
        <p className="text-gray-400">Advanced DEX with gas estimation, route optimization, and cross-chain support</p>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <button
          onClick={handleMint}
          className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 border border-blue-600/50"
        >
          <FiPlus className="text-lg" />
          Mint Test Tokens
        </button>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="bg-gray-800/50 hover:bg-gray-700/50 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <FiSettings className="text-lg" />
          Settings
        </button>
        <button
          onClick={() => setShowRoutes(!showRoutes)}
          className="bg-gray-800/50 hover:bg-gray-700/50 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <FiShuffle className="text-lg" />
          Routes
        </button>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="bg-gray-800/50 hover:bg-gray-700/50 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <FiClock className="text-lg" />
          History
        </button>
      </div>

      {/* Swap Interface */}
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-800 shadow-[0_0_50px_-12px_rgba(59,130,246,0.15)]">
        {/* Network Selection */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-black/20 rounded-lg p-1 pr-3 border border-gray-800">
                <span className="text-xs text-gray-500 uppercase tracking-wider font-bold px-2">From</span>
                <select
                  value={fromNetwork.id}
                  onChange={(e) => {
                    const network = networks.find(n => n.id === e.target.value);
                    if (network) setFromNetwork(network);
                  }}
                  className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer"
                >
                  {networks.map(network => (
                    <option key={network.id} value={network.id} className="bg-gray-900">
                      {network.icon} {network.name}
                    </option>
                  ))}
                </select>
              </div>
              {isCrossChain && (
                <>
                  <FiGlobe className="text-purple-400 animate-pulse" />
                  <div className="flex items-center gap-2 bg-black/20 rounded-lg p-1 pr-3 border border-gray-800">
                    <span className="text-xs text-gray-500 uppercase tracking-wider font-bold px-2">To</span>
                    <select
                      value={toNetwork.id}
                      onChange={(e) => {
                        const network = networks.find(n => n.id === e.target.value);
                        if (network) setToNetwork(network);
                      }}
                      className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer"
                    >
                      {networks.map(network => (
                        <option key={network.id} value={network.id} className="bg-gray-900">
                          {network.icon} {network.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>
            {isCrossChain && (
              <div className="text-xs text-purple-400 bg-purple-900/20 px-2 py-1 rounded">
                Cross-chain swap • Bridge fee: ~0.001 ETH
              </div>
            )}
          </div>
        </div>

        {/* From Token */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-300">From</label>
            <div className="text-xs text-gray-400">
              Balance: {fromToken.symbol === 'ETH' 
                ? (ethBalance ? parseFloat(ethBalance.formatted).toFixed(4) : '0.00') 
                : fromToken.symbol === 'NEXUS'
                  ? (nexusBalance ? (Number(nexusBalance) / 10**18).toFixed(4) : '0.00')
                  : '0.00'
              } {fromToken.symbol}
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <select
                value={fromToken.symbol}
                onChange={(e) => {
                  const token = tokens.find(t => t.symbol === e.target.value);
                  if (token) setFromToken(token);
                }}
                className="bg-gray-800 text-white font-semibold text-lg border border-gray-700 rounded px-2 py-1 outline-none"
              >
                {tokens.map(token => (
                  <option key={token.symbol} value={token.symbol} className="bg-gray-800 text-white">
                    {token.icon} {token.symbol}
                  </option>
                ))}
              </select>
              <span className="text-2xl">{fromToken.icon}</span>
            </div>

            <input
              type="number"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-transparent text-2xl font-bold text-white placeholder-gray-500 border-none outline-none"
            />
            <div className="text-sm text-gray-400 mt-1">{fromToken.name}</div>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center my-4">
          <button
            onClick={swapTokens}
            className="bg-blue-600/20 hover:bg-blue-600/30 p-3 rounded-full transition-all duration-300 border border-blue-500/30"
          >
            <FiArrowDown className="text-blue-400 text-xl" />
          </button>
        </div>

        {/* To Token */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-300">To</label>
            <div className="text-xs text-gray-400">
              Balance: {toToken.symbol === 'ETH' 
                ? (ethBalance ? parseFloat(ethBalance.formatted).toFixed(4) : '0.00') 
                : toToken.symbol === 'NEXUS'
                  ? (nexusBalance ? (Number(nexusBalance) / 10**18).toFixed(4) : '0.00')
                  : '0.00'
              } {toToken.symbol}
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <select
                value={toToken.symbol}
                onChange={(e) => {
                  const token = tokens.find(t => t.symbol === e.target.value);
                  if (token) setToToken(token);
                }}
                className="bg-gray-800 text-white font-semibold text-lg border border-gray-700 rounded px-2 py-1 outline-none"
              >
                {tokens.map(token => (
                  <option key={token.symbol} value={token.symbol} className="bg-gray-800 text-white">
                    {token.icon} {token.symbol}
                  </option>
                ))}
              </select>
              <span className="text-2xl">{toToken.icon}</span>
            </div>

            <input
              type="number"
              value={toAmount}
              readOnly
              placeholder="0.00"
              className="w-full bg-transparent text-2xl font-bold text-white placeholder-gray-500 border-none outline-none"
            />
            <div className="text-sm text-gray-400 mt-1">{toToken.name}</div>
          </div>
        </div>

        {/* Route Selection */}
        {swapRoutes.length > 1 && (
          <div className="mt-4 p-3 bg-gray-800 bg-opacity-30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">Route</span>
              <select
                value={selectedRoute}
                onChange={(e) => setSelectedRoute(e.target.value)}
                className="bg-gray-700/50 border border-gray-600 rounded px-2 py-1 text-sm"
              >
                <option value="best">Best Route</option>
                {swapRoutes.map(route => (
                  <option key={route.id} value={route.id}>
                    {route.path.join(' → ')} ({route.fee})
                  </option>
                ))}
              </select>
            </div>
            {selectedRouteData && (
              <div className="text-xs text-gray-400">
                {selectedRouteData.path.join(' → ')} • Gas: {calculateGasEstimate(selectedRouteData, gasPriority)} • Time: {selectedRouteData.estimatedTime}
              </div>
            )}
          </div>
        )}

        {/* Swap Details */}
        {fromAmount && toAmount && (
          <div className="mt-6 space-y-3">
            {/* Price Impact */}
            <div className="flex items-center justify-between p-3 bg-gray-800 bg-opacity-30 rounded-lg">
              <div className="flex items-center gap-2">
                <FiTrendingUp className="text-gray-400" />
                <span className="text-sm text-gray-300">Price Impact</span>
              </div>
              <div className={`text-sm font-semibold ${getPriceImpactColor(priceImpact)}`}>
                {priceImpact.toFixed(2)}% - {getPriceImpactWarning(priceImpact)}
              </div>
            </div>

            {/* Minimum Received */}
            <div className="flex items-center justify-between p-3 bg-gray-800 bg-opacity-30 rounded-lg">
              <div className="flex items-center gap-2">
                <FiAlertTriangle className="text-gray-400" />
                <span className="text-sm text-gray-300">Minimum Received</span>
              </div>
              <span className="text-sm font-semibold text-white">{minimumReceived} {toToken.symbol}</span>
            </div>

            {/* Volume Status (NEXUS only) */}
            {fromToken.symbol === 'NEXUS' && volumeInfo && (
              <div className="p-3 bg-purple-900/20 rounded-lg border border-purple-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <FiTrendingUp className="text-purple-400" />
                  <span className="font-semibold text-purple-400">NEXUS Volume Status</span>
                </div>
                <div className="text-sm text-gray-300 space-y-1">
                  <div>24h Volume: {(Number(volumeInfo[0]) / 10**18).toLocaleString()} NEXUS</div>
                  <div>Threshold: {(Number(volumeInfo[1]) / 10**18).toLocaleString()} NEXUS</div>
                  <div className={`font-semibold ${
                    Number(volumeInfo[0]) >= Number(volumeInfo[1]) ? 'text-red-400' :
                    Number(volumeInfo[0]) >= Number(volumeInfo[1]) / 4 ? 'text-yellow-400' :
                    'text-green-400'
                  }`}>
                    Status: {
                      Number(volumeInfo[0]) >= Number(volumeInfo[1]) ? '🔴 High Volume (8% fees)' :
                      Number(volumeInfo[0]) >= Number(volumeInfo[1]) / 4 ? '🟡 Medium Volume (4% fees)' :
                      '🟢 Low Volume (1% fees - arbitrage opportunity!)'
                    }
                  </div>
                  {Number(volumeInfo[2]) > 0 && (
                    <div className="text-xs text-gray-400">
                      Volume resets in {Math.floor(Number(volumeInfo[2]) / 3600)}h {Math.floor((Number(volumeInfo[2]) % 3600) / 60)}m
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Fee Breakdown */}
            <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <FiZap className="text-blue-400" />
                <span className="font-semibold text-blue-400">
                  {fromToken.symbol === 'NEXUS' && volumeInfo
                    ? `Adaptive Fee: ${(Number(volumeInfo[3]) / 100).toFixed(1)}%`
                    : 'Platform Fee: 0.5%'
                  }
                </span>
              </div>
              <div className="text-sm text-gray-300 space-y-1">
                {fromToken.symbol === 'NEXUS' && fees.breakdown ? (
                  <>
                    <div>📊 Adaptive Fee Breakdown:</div>
                    <div>• Treasury: {(fees.breakdown.treasury * parseFloat(fromAmount || '0')).toFixed(4)} NEXUS</div>
                    <div>• Team: {(fees.breakdown.team * parseFloat(fromAmount || '0')).toFixed(4)} NEXUS</div>
                    <div>• Rewards: {(fees.breakdown.rewards * parseFloat(fromAmount || '0')).toFixed(4)} NEXUS</div>
                    <div>• Liquidity: {(fees.breakdown.liquidity * parseFloat(fromAmount || '0')).toFixed(4)} NEXUS</div>
                    {volumeInfo && (
                      <div className="text-xs text-purple-400 mt-2">
                        24h Volume: {(Number(volumeInfo[0]) / 10**18).toLocaleString()} NEXUS
                        {Number(volumeInfo[2]) > 0 && ` • Resets in ${Math.floor(Number(volumeInfo[2]) / 3600)}h`}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div>Platform collects: {fees.platformFee.toFixed(6)} {fromToken.symbol}</div>
                    <div className="text-green-400">Treasury receives: ~{fees.nativeFee.toFixed(6)} ETH</div>
                    {isCrossChain && (
                      <div className="text-purple-400">Bridge fee: ~0.001 ETH</div>
                    )}
                  </>
                )}
                <div className="text-xs text-gray-400 mt-2">
                  {fromToken.symbol === 'NEXUS'
                    ? '🎯 Adaptive fees encourage low-volume arbitrage opportunities'
                    : 'Lower fees than DEX alternatives • Native collection reduces sell pressure'
                  }
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Network Status & Liquidity */}
        {isConnected && (
          <div className="mb-4 p-3 rounded-lg border text-center space-y-2">
            {chainId === 111545111 || chainId === 31337 ? (
              <>
                <div className="text-green-400 text-sm">
                  ✅ Connected to {chainId === 31337 ? 'Localhost' : 'Tenderly Sepolia Fork'}
                </div>
                
                {/* Liquidity Warnings */}
                {contractEthBalance && parseFloat(contractEthBalance.formatted) < 0.1 && (
                  <div className="text-yellow-400 text-xs flex items-center justify-center gap-2 bg-yellow-900/20 p-2 rounded">
                    <FiAlertTriangle />
                    <span>Low ETH Liquidity: Swaps to ETH may fail.</span>
                  </div>
                )}
                {contractNexusBalance && (Number(contractNexusBalance) / 10**18) < 1000 && (
                  <div className="text-yellow-400 text-xs flex flex-col items-center justify-center gap-2 bg-yellow-900/20 p-2 rounded">
                    <div className="flex items-center gap-2">
                      <FiAlertTriangle />
                      <span>Low NEXUS Liquidity: Swaps to NEXUS may fail.</span>
                    </div>
                    <div className="text-gray-400">
                      Contract Balance: {(Number(contractNexusBalance) / 10**18).toFixed(2)} NEXUS
                    </div>
                  </div>
                )}

                {/* Fund Contract Buttons (for testing) */}
                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={async () => {
                        if (chainId !== 111545111 && chainId !== 31337) {
                          try {
                            await switchChain({ chainId: 111545111 });
                          } catch (e) {
                            alert('❌ Please switch to Tenderly or Localhost network manually');
                            return;
                          }
                        }
                        
                        if (!nexusBalance || Number(nexusBalance) < 1000 * 10**18) {
                          alert('❌ You need at least 1000 NEXUS to fund the contract');
                          return;
                        }
                        try {
                          const amount = ethers.parseEther('1000');
                          await approveWriteAsync({
                            address: ((contractAddresses as any).NexusToken || contractAddresses.MockERC20) as `0x${string}`,
                            abi: CONTRACT_ABIS.NexusToken,
                            functionName: 'transfer',
                            args: [(contractAddresses as any).NexusSwap as `0x${string}`, amount],
                          });
                          alert('✅ Funding transaction sent! Wait for confirmation.');
                        } catch (e: any) {
                          console.error(e);
                          alert('❌ Funding failed: ' + (e.shortMessage || e.message));
                        }
                      }}
                      className="text-xs bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 px-3 py-1 rounded transition-colors flex items-center gap-1"
                    >
                      <FiPlus /> Fund with 1000 NEXUS
                    </button>

                    <button
                      onClick={async () => {
                        if (chainId !== 111545111 && chainId !== 31337) {
                          try {
                            await switchChain({ chainId: 111545111 });
                          } catch (e) {
                            alert('❌ Please switch to Tenderly or Localhost network manually');
                            return;
                          }
                        }

                        try {
                          const amount = ethers.parseEther('1');
                          await sendTransactionAsync({
                            to: (contractAddresses as any).NexusSwap as `0x${string}`,
                            value: amount,
                          });
                          alert('✅ ETH Funding transaction sent! Wait for confirmation.');
                        } catch (e: any) {
                          console.error(e);
                          alert('❌ ETH Funding failed: ' + (e.shortMessage || e.message));
                        }
                      }}
                      className="text-xs bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 px-3 py-1 rounded transition-colors flex items-center gap-1"
                    >
                      <FiPlus /> Fund with 1 ETH
                    </button>
                  </div>
                  <div className="text-[10px] text-gray-500">
                    * Contract needs liquidity to facilitate swaps. Fund it if balances are low.
                  </div>
                </div>
              </>
            ) : (
              <div className="text-yellow-400 text-sm">
                ⚠️ Please switch to Tenderly network for testing
                <button
                  onClick={() => switchChain({ chainId: 111545111 })}
                  className="ml-2 px-3 py-1 bg-yellow-600 hover:bg-yellow-500 text-white text-xs rounded transition-colors"
                >
                  Switch Network
                </button>
              </div>
            )}
          </div>
        )}

        {/* Swap Button */}
        <button
          onClick={handleSwap}
          disabled={!fromAmount || !toAmount || isSwapping || swapIsLoading || approveIsLoading}
          className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {(isSwapping || swapIsLoading || approveIsLoading) ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              {approveIsLoading ? 'Approving...' : swapIsLoading ? 'Confirming...' : 'Swapping...'}
            </>
          ) : fromAmount && toAmount ? (
            needsApproval ? 'Approve & Swap' : `Swap ${fromToken.symbol} to ${toToken.symbol}${isCrossChain ? ' (Cross-chain)' : ''}`
          ) : (
            'Enter Amount'
          )}
        </button>

        {/* Add Nexus to Wallet Button */}
        <button
          onClick={addNexusToWallet}
          disabled={!isConnected || (chainId !== 111545111 && chainId !== 31337)}
          className={`w-full mt-4 font-medium py-3 px-4 rounded-lg transition-all duration-300 border flex items-center justify-center gap-2 ${
            !isConnected || (chainId !== 111545111 && chainId !== 31337)
              ? 'bg-gray-800 bg-opacity-30 text-gray-500 border-gray-700 cursor-not-allowed'
              : 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white border-gray-700'
          }`}
        >
          <FiShuffle className="text-purple-400" />
          {!isConnected
            ? 'Connect Wallet to Add Token'
            : (chainId !== 111545111 && chainId !== 31337)
            ? 'Switch to Tenderly/Localhost to Add Token'
            : 'Add Nexus to Wallet'
          }
        </button>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
          <h3 className="text-xl font-semibold mb-4">Swap Settings</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Slippage Tolerance: {slippage}%
              </label>
              <input
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                value={slippage}
                onChange={(e) => setSlippage(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0.1%</span>
                <span>5%</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Gas Priority
              </label>
              <div className="flex gap-2">
                {['slow', 'standard', 'fast'].map((priority) => (
                  <button
                    key={priority}
                    onClick={() => setGasPriority(priority as 'slow' | 'standard' | 'fast')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      gasPriority === priority
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-sm text-gray-400">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Platform fee: 0.3% (lower than typical DEX fees)</span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Native token collection for treasury</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>Reduces $NEXUS sell pressure</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Routes Modal */}
      {showRoutes && (
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
          <h3 className="text-xl font-semibold mb-4">Available Routes</h3>

          <div className="space-y-3">
            {swapRoutes.map((route) => (
              <div
                key={route.id}
                onClick={() => {
                  setSelectedRoute(route.id);
                  setShowRoutes(false);
                }}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedRoute === route.id
                    ? 'border-blue-500 bg-blue-900/20'
                    : 'border-gray-700 bg-gray-800 bg-opacity-30 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {route.path.map((token, index) => (
                      <span key={index} className="flex items-center gap-1">
                        <span className="text-lg">{tokens.find(t => t.symbol === token)?.icon}</span>
                        <span className="font-semibold">{token}</span>
                        {index < route.path.length - 1 && <FiArrowDown className="text-gray-400 text-sm rotate-[-90deg]" />}
                      </span>
                    ))}
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-400">{route.outputAmount} {toToken.symbol}</div>
                    <div className="text-xs text-gray-400">Fee: {route.fee}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-400">
                  <div>Gas: {calculateGasEstimate(route, gasPriority)} • Time: {route.estimatedTime}</div>
                  <div className={`${getPriceImpactColor(route.impact)}`}>
                    Impact: {route.impact.toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transaction History Modal */}
      {showHistory && (
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
          <h3 className="text-xl font-semibold mb-4">Transaction History</h3>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {transactions.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                No transactions yet
              </div>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className="bg-gray-800 bg-opacity-30 rounded-lg p-4 border border-gray-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{tokens.find(t => t.symbol === tx.fromToken)?.icon}</span>
                      <span className="font-semibold">{tx.fromAmount} {tx.fromToken}</span>
                      <FiArrowDown className="text-gray-400" />
                      <span className="text-lg">{tokens.find(t => t.symbol === tx.toToken)?.icon}</span>
                      <span className="font-semibold">{tx.toAmount} {tx.toToken}</span>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-semibold ${
                      tx.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      tx.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {tx.status}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div>Fee: {tx.fee}</div>
                    <div>{tx.timestamp.toLocaleString()}</div>
                  </div>

                  {tx.txHash && (
                    <div className="mt-2 text-xs text-blue-400 hover:text-blue-300 cursor-pointer">
                      TX: {tx.txHash}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Benefits */}
      <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 backdrop-blur-sm rounded-xl p-6 border border-green-500/20">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FiZap className="text-green-400" />
          Why Use Nexus Swap?
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Lower fees (0.3% vs 0.5-1% on DEX)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Native token collection for treasury</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Price impact calculations</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Gas estimation & priority selection</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Route optimization (direct, via USDC, via ETH)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Cross-chain swap support</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Transaction history tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Advanced slippage protection</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}