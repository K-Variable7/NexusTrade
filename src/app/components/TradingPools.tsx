'use client';

import { useState, useEffect } from 'react';
import { FiTrendingUp, FiUsers, FiDollarSign, FiTarget } from 'react-icons/fi';
import { useAccount, useReadContract, useWriteContract, useChainId, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_CONFIGS } from '../../lib/contracts';
import { formatEther, parseEther } from 'viem';

interface TradingPool {
  id: string;
  name: string;
  description: string;
  creator: string;
  totalValue: number;
  memberCount: number;
  profitShare: number;
  riskLevel: 'low' | 'medium' | 'high';
  performance: number;
  isActive: boolean;
  createdAt: string;
}

export default function TradingPools() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [pools, setPools] = useState<TradingPool[]>([]);
  const [selectedPool, setSelectedPool] = useState<TradingPool | null>(null);
  const [showCreatePool, setShowCreatePool] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [showJoinPool, setShowJoinPool] = useState(false);

  // Form state for creating pools
  const [poolName, setPoolName] = useState('');
  const [poolDescription, setPoolDescription] = useState('');
  const [poolDuration, setPoolDuration] = useState('604800'); // 7 days in seconds

  // Get contract config for current chain
  const contractConfig = chainId === 31337 ? (CONTRACT_CONFIGS as any).localhost?.TradingPool : chainId === 111545111 ? CONTRACT_CONFIGS.tenderly.TradingPool : chainId === 11155111 ? CONTRACT_CONFIGS.sepolia.TradingPool : null;
  const mockTokenConfig = chainId === 31337 ? (CONTRACT_CONFIGS as any).localhost?.MockERC20 : chainId === 111545111 ? CONTRACT_CONFIGS.tenderly.MockERC20 : chainId === 11155111 ? CONTRACT_CONFIGS.sepolia.MockERC20 : null;

  // Read contract data
  const { data: poolCount } = useReadContract({
    ...contractConfig,
    functionName: 'poolCount',
    query: {
      enabled: !!contractConfig && isConnected,
    },
  });

  const { data: taxRate } = useReadContract({
    ...contractConfig,
    functionName: 'taxRate',
    query: {
      enabled: !!contractConfig && isConnected,
    },
  });

  const { data: tokenBalance } = useReadContract({
    ...mockTokenConfig,
    functionName: 'balanceOf',
    args: [address],
    query: {
      enabled: !!mockTokenConfig && isConnected && !!address,
    },
  });

  // Write contract functions
  const { writeContractAsync: createPoolContract, isPending: isCreating } = useWriteContract();
  const { writeContractAsync: joinPoolContract, data: joinHash } = useWriteContract();
  const { writeContractAsync: approveToken, data: approveHash } = useWriteContract();

  // Transaction monitoring
  const { isLoading: isApproving, isSuccess: isApproved } = useWaitForTransactionReceipt({ hash: approveHash });
  const { isLoading: isJoining, isSuccess: isJoined } = useWaitForTransactionReceipt({ hash: joinHash });

  // State to track pending join action
  const [pendingJoinPoolId, setPendingJoinPoolId] = useState<string | null>(null);

  // Effect to trigger join after approval
  useEffect(() => {
    if (isApproved && pendingJoinPoolId && contractConfig && depositAmount) {
      const join = async () => {
        try {
          console.log('Approval confirmed, joining pool...');
          await joinPoolContract({
            ...contractConfig,
            functionName: 'joinPool',
            args: [BigInt(pendingJoinPoolId), parseEther(depositAmount)],
          });
          setPendingJoinPoolId(null);
          setDepositAmount('');
          setSelectedPool(null);
          alert('✅ Join transaction sent! Waiting for confirmation...');
        } catch (error) {
          console.error('Error joining pool:', error);
          setPendingJoinPoolId(null);
        }
      };
      join();
    }
  }, [isApproved, pendingJoinPoolId, contractConfig, depositAmount, joinPoolContract]);

  // Effect for join success
  useEffect(() => {
    if (isJoined) {
      alert('✅ Successfully joined the pool!');
    }
  }, [isJoined]);

  // Read user stake for the first pool (Community Pool) as an example
  // In a real app, we would fetch this for all pools or use a multicall
  const { data: userStake } = useReadContract({
    ...contractConfig,
    functionName: 'getUserStake',
    args: [BigInt(1), address], // Using ID 1 for Community Pool
    query: {
      enabled: !!contractConfig && isConnected && !!address,
    },
  });

  // Contract interaction functions
  const handleCreatePool = async () => {
    if (!contractConfig || !poolName.trim()) return;

    try {
      await createPoolContract({
        ...contractConfig,
        functionName: 'createPool',
        args: [poolName, BigInt(poolDuration)],
      });

      // Reset form
      setPoolName('');
      setPoolDescription('');
      setPoolDuration('604800');
      setShowCreatePool(false);
      alert('✅ Pool creation transaction sent!');
    } catch (error) {
      console.error('Error creating pool:', error);
    }
  };

  const handleJoinPool = async (poolId: string) => {
    if (!contractConfig || !mockTokenConfig || !depositAmount) return;

    try {
      console.log('Approving token...');
      setPendingJoinPoolId(poolId);
      
      // First approve the token
      await approveToken({
        ...mockTokenConfig,
        functionName: 'approve',
        args: [contractConfig.address, parseEther(depositAmount)],
      });
      
      // The useEffect will handle the rest after approval is confirmed
    } catch (error) {
      console.error('Error initiating join:', error);
      setPendingJoinPoolId(null);
    }
  };

  // Mock data for now - will be replaced with real contract data
  useEffect(() => {
    const mockPools: TradingPool[] = [
      {
        id: '1', // Real pool ID from contract (starts at 1)
        name: 'Community Pool',
        description: 'Official NexusTrade community trading pool with profit sharing',
        creator: '0x9c9BFa9207560E726bdf3577a5059dC3DDD05c94',
        totalValue: 0, // Will be populated from contract
        memberCount: 0, // Will be populated from contract
        profitShare: taxRate ? Number(taxRate) : 5,
        riskLevel: 'medium',
        performance: 0, // Will be calculated from contract data
        isActive: true,
        createdAt: '2025-12-03'
      },
      {
        id: '2',
        name: 'DeFi Yield Hunters (Coming Soon)',
        description: 'Community pool focused on high-yield DeFi strategies with automated rebalancing',
        creator: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        totalValue: 125000,
        memberCount: 47,
        profitShare: 15,
        riskLevel: 'medium',
        performance: 23.5,
        isActive: false,
        createdAt: '2024-12-01'
      },
      {
        id: '3',
        name: 'Conservative HODLers (Coming Soon)',
        description: 'Long-term holding strategy with blue-chip assets and steady growth',
        creator: '0x8ba1f109551bD432803012645261768374161',
        totalValue: 89000,
        memberCount: 23,
        profitShare: 10,
        riskLevel: 'low',
        performance: 8.2,
        isActive: false,
        createdAt: '2024-11-28'
      },
      {
        id: '4',
        name: 'Meme Coin Raiders (Coming Soon)',
        description: 'High-risk, high-reward meme coin trading with community signals',
        creator: '0x4a2d35Cc6634C0532925a3b844Bc454e4438f44f',
        totalValue: 67000,
        memberCount: 89,
        profitShare: 20,
        riskLevel: 'high',
        performance: -12.3,
        isActive: false,
        createdAt: '2024-12-02'
      },
      {
        id: '5',
        name: 'Arbitrage Masters (Coming Soon)',
        description: 'Cross-exchange arbitrage opportunities with automated execution',
        creator: '0x9c3d35Cc6634C0532925a3b844Bc454e4438f45a',
        totalValue: 156000,
        memberCount: 34,
        profitShare: 18,
        riskLevel: 'medium',
        performance: 31.7,
        isActive: false,
        createdAt: '2024-11-25'
      }
    ];

    setPools(mockPools);
  }, []);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400 bg-green-900/20';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20';
      case 'high': return 'text-red-400 bg-red-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getPerformanceColor = (performance: number) => {
    if (performance > 0) return 'text-green-400';
    if (performance < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  return (
    <div className="bg-white/5 backdrop-blur-md p-6 rounded-xl border border-white/10 shadow-lg hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:border-white/20 group">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <FiTrendingUp className="text-blue-400 text-3xl mr-3 group-hover:text-blue-300 transition-colors duration-300" />
          <h2 className="text-xl font-medium text-white group-hover:text-blue-100 transition-colors duration-300">Trading Pools</h2>
        </div>
        <button
          onClick={() => setShowCreatePool(true)}
          className="bg-blue-600/80 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition-all duration-300 text-sm font-medium shadow-lg hover:shadow-blue-500/25"
        >
          Create Pool
        </button>
      </div>

      {/* My Active Pools Dashboard */}
      {!!userStake && (userStake as any).amount > 0 && (
        <div className="mb-6 bg-blue-900/20 rounded-xl p-4 border border-blue-500/30">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-blue-300">
            <FiTarget className="text-blue-400" />
            My Active Pools
          </h3>
          <div className="bg-slate-900/50 rounded-lg p-3 flex items-center justify-between border border-blue-500/20">
            <div>
              <div className="text-sm font-bold text-white">Community Pool</div>
              <div className="text-xs text-gray-400">
                Staked: {formatEther((userStake as any).amount)} NEXUS
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-medium text-green-400 bg-green-900/20 px-2 py-1 rounded">Active</div>
              <div className="text-[10px] text-gray-500 mt-1">Joined: {new Date(Number((userStake as any).joinTime) * 1000).toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {pools.map((pool) => (
          <div
            key={pool.id}
            className="bg-slate-900/30 p-4 rounded-lg border border-blue-400/10 hover:bg-slate-900/50 transition-colors duration-200 cursor-pointer"
            onClick={() => setSelectedPool(pool)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h3 className="text-white font-medium mr-3">{pool.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${getRiskColor(pool.riskLevel)}`}>
                    {pool.riskLevel.toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">{pool.description}</p>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${getPerformanceColor(pool.performance)}`}>
                  {pool.performance > 0 ? '+' : ''}{pool.performance.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">30d return</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex items-center">
                <FiDollarSign className="text-green-400 mr-1" />
                <span className="text-gray-300">${pool.totalValue.toLocaleString()}</span>
              </div>
              <div className="flex items-center">
                <FiUsers className="text-blue-400 mr-1" />
                <span className="text-gray-300">{pool.memberCount} members</span>
              </div>
              <div className="flex items-center">
                <FiTarget className="text-purple-400 mr-1" />
                <span className="text-gray-300">{pool.profitShare}% share</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pool Details Modal */}
      {selectedPool && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 p-6 rounded-xl border border-white/20 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">{selectedPool.name}</h3>
              <button
                onClick={() => setSelectedPool(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-gray-300">{selectedPool.description}</p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-gray-400 text-sm">Total Value</div>
                  <div className="text-white font-bold">${selectedPool.totalValue.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Members</div>
                  <div className="text-white font-bold">{selectedPool.memberCount}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Profit Share</div>
                  <div className="text-white font-bold">{selectedPool.profitShare}%</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">30d Performance</div>
                  <div className={`font-bold ${getPerformanceColor(selectedPool.performance)}`}>
                    {selectedPool.performance > 0 ? '+' : ''}{selectedPool.performance.toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-700">
                <div className="text-gray-400 text-sm mb-2">Created by</div>
                <div className="text-white font-mono text-sm">
                  {selectedPool.creator.slice(0, 6)}...{selectedPool.creator.slice(-4)}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowJoinPool(true)}
                  disabled={!selectedPool.isActive}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {selectedPool.isActive ? 'Join Pool' : 'Coming Soon'}
                </button>
                <button className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-500 transition-colors">
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Pool Modal */}
      {showCreatePool && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 p-6 rounded-xl border border-white/20 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Create Trading Pool</h3>
              <button
                onClick={() => setShowCreatePool(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Pool Name</label>
                <input
                  type="text"
                  value={poolName}
                  onChange={(e) => setPoolName(e.target.value)}
                  className="w-full bg-slate-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-400 focus:outline-none"
                  placeholder="Enter pool name"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Description</label>
                <textarea
                  value={poolDescription}
                  onChange={(e) => setPoolDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-400 focus:outline-none h-24"
                  placeholder="Describe your trading strategy"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Duration (days)</label>
                <select
                  value={poolDuration}
                  onChange={(e) => setPoolDuration(e.target.value)}
                  className="w-full bg-slate-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-400 focus:outline-none"
                >
                  <option value="86400">1 Day</option>
                  <option value="604800">7 Days</option>
                  <option value="2592000">30 Days</option>
                </select>
              </div>

              <button
                onClick={handleCreatePool}
                disabled={isCreating || !poolName.trim()}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? 'Creating Pool...' : 'Create Pool'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join Pool Modal */}
      {showJoinPool && selectedPool && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 p-6 rounded-xl border border-white/20 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Join {selectedPool.name}</h3>
              <button
                onClick={() => setShowJoinPool(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-800 p-4 rounded-lg">
                <div className="text-gray-400 text-sm mb-2">Pool Details</div>
                <div className="text-white text-sm">
                  <div>Profit Share: {selectedPool.profitShare}%</div>
                  <div>Tax Rate: {taxRate ? `${taxRate}%` : '5%'}</div>
                  <div>Token: MockERC20</div>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  Deposit Amount (Mock Tokens)
                  {!!tokenBalance && (
                    <span className="float-right text-xs text-blue-400">
                      Balance: {formatEther(tokenBalance as bigint)}
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full bg-slate-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-400 focus:outline-none"
                  placeholder="100"
                  step="0.01"
                />
              </div>

              <div className="text-sm text-gray-400">
                Note: You'll need to approve the token first, then join the pool.
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => handleJoinPool(selectedPool.id)}
                  disabled={isApproving || isJoining || !depositAmount || (!!tokenBalance && !!depositAmount && parseEther(depositAmount) > (tokenBalance as bigint))}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isApproving ? 'Approving...' : isJoining ? 'Joining...' : 'Join Pool'}
                </button>
                <button
                  onClick={() => setShowJoinPool(false)}
                  className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}