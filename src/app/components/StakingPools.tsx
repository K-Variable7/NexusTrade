'use client';

import { useState, useEffect } from 'react';
import { FiLock, FiTrendingUp, FiClock, FiDollarSign, FiTarget, FiZap, FiAward, FiBarChart } from 'react-icons/fi';
import { useAccount, useReadContract, useWriteContract, useChainId, useBalance } from 'wagmi';
import { CONTRACT_CONFIGS, CONTRACT_ABIS } from '../../lib/contracts';
import { formatEther, parseEther } from 'viem';

interface StakingOption {
  period: string;
  months: number;
  baseApy: number;
  multiplier: number;
  minStake: number;
}

interface TraderMetrics {
  totalVolume: number;
  successfulTrades: number;
  totalTrades: number;
  winRate: number;
  profitLoss: number;
  streak: number;
}

interface VolumeTier {
  name: string;
  minVolume: number;
  bonusMultiplier: number;
  color: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  bonus: number;
}

export default function StakingPools() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [selectedToken, setSelectedToken] = useState<'NEXUS' | 'ETH' | 'ARB' | 'MATIC'>('NEXUS');
  const [stakeAmount, setStakeAmount] = useState('');
  const [platformVolume, setPlatformVolume] = useState(2500000); // Mock platform volume in USD
  const [traderMetrics, setTraderMetrics] = useState<TraderMetrics>({
    totalVolume: 125000,
    successfulTrades: 85,
    totalTrades: 120,
    winRate: 70.8,
    profitLoss: 15680,
    streak: 5
  });

  // Get contract config for current chain
  const contractConfig = chainId === 31337 ? (CONTRACT_CONFIGS as any).localhost?.Staking : chainId === 111545111 ? CONTRACT_CONFIGS.tenderly.Staking : chainId === 11155111 ? CONTRACT_CONFIGS.sepolia.Staking : null;
  const tokenConfig = chainId === 31337 ? (CONTRACT_CONFIGS as any).localhost?.NexusToken : chainId === 111545111 ? CONTRACT_CONFIGS.tenderly.NexusToken : chainId === 11155111 ? CONTRACT_CONFIGS.sepolia.NexusToken : null;

  // Read Balance
  const { data: tokenBalance } = useReadContract({
    ...tokenConfig,
    functionName: 'balanceOf',
    args: [address],
    query: { enabled: !!address && !!tokenConfig && selectedToken === 'NEXUS' },
  });

  // Write Contracts
  const { writeContract: stakeContract, isPending: isStaking } = useWriteContract();
  const { writeContract: approveContract, isPending: isApproving } = useWriteContract();

  const handlePercentageClick = (percentage: number) => {
    if (!tokenBalance) return;
    const balance = formatEther(tokenBalance as bigint);
    const amount = (parseFloat(balance) * percentage) / 100;
    setStakeAmount(amount.toString());
  };

  const handleStake = async (months: number) => {
    if (!contractConfig || !tokenConfig || !stakeAmount) return;
    
    try {
      const amount = parseEther(stakeAmount);
      const lockPeriod = BigInt(months * 30 * 24 * 60 * 60); // months to seconds

      // Approve first
      await approveContract({
        ...tokenConfig,
        functionName: 'approve',
        args: [contractConfig.address, amount],
      });

      // Then stake
      await stakeContract({
        ...contractConfig,
        functionName: 'stake',
        args: [amount, lockPeriod],
      });
      
      alert('✅ Staking transaction sent!');
    } catch (error: any) {
      console.error('Staking error:', error);
      alert('❌ Staking failed: ' + (error.message || 'Unknown error'));
    }
  };

  // Read User Stakes
  const { data: userStakes } = useReadContract({
    ...contractConfig,
    functionName: 'getUserStakes',
    args: [address],
    query: { enabled: !!address && !!contractConfig },
  });

  const stakingOptions: StakingOption[] = [
    { period: '1 Month', months: 1, baseApy: 8, multiplier: 1, minStake: 10 },
    { period: '3 Months', months: 3, baseApy: 12, multiplier: 1.5, minStake: 25 },
    { period: '6 Months', months: 6, baseApy: 18, multiplier: 2.2, minStake: 50 },
    { period: '12 Months', months: 12, baseApy: 28, multiplier: 3.5, minStake: 100 },
  ];

  const volumeTiers: VolumeTier[] = [
    { name: 'Bronze', minVolume: 0, bonusMultiplier: 1.0, color: 'text-orange-400' },
    { name: 'Silver', minVolume: 50000, bonusMultiplier: 1.2, color: 'text-gray-300' },
    { name: 'Gold', minVolume: 250000, bonusMultiplier: 1.5, color: 'text-yellow-400' },
    { name: 'Platinum', minVolume: 1000000, bonusMultiplier: 2.0, color: 'text-blue-400' },
    { name: 'Diamond', minVolume: 5000000, bonusMultiplier: 3.0, color: 'text-purple-400' },
  ];

  const achievements: Achievement[] = [
    { id: 'first_trade', name: 'First Steps', description: 'Complete your first trade', icon: '🎯', unlocked: true, bonus: 0.1 },
    { id: 'win_streak', name: 'Hot Streak', description: '5+ consecutive winning trades', icon: '🔥', unlocked: traderMetrics.streak >= 5, bonus: 0.25 },
    { id: 'profit_master', name: 'Profit Master', description: '15k+ total profit', icon: '💰', unlocked: traderMetrics.profitLoss >= 15000, bonus: 0.5 },
    { id: 'volume_champion', name: 'Volume Champion', description: '100k+ trading volume', icon: '📈', unlocked: traderMetrics.totalVolume >= 100000, bonus: 0.75 },
    { id: 'legend', name: 'Trading Legend', description: '80%+ win rate', icon: '👑', unlocked: traderMetrics.winRate >= 80, bonus: 1.0 },
  ];

  const getCurrentVolumeTier = (volume: number): VolumeTier => {
    return volumeTiers.slice().reverse().find(tier => volume >= tier.minVolume) || volumeTiers[0];
  };

  const calculateAdaptiveRewards = (amount: number, option: StakingOption) => {
    const baseAnnualReward = (amount * option.baseApy) / 100;
    const periodReward = (baseAnnualReward * option.months) / 12;

    // Volume-based multiplier
    const volumeTier = getCurrentVolumeTier(traderMetrics.totalVolume);
    const volumeMultiplier = volumeTier.bonusMultiplier;

    // Performance multiplier (win rate bonus)
    const performanceMultiplier = 1 + (traderMetrics.winRate / 100) * 0.5; // Up to 50% bonus for 100% win rate

    // Platform volume bonus (scales with total platform success)
    const platformBonus = Math.min(platformVolume / 10000000, 2); // Up to 2x for 10M volume

    // Achievement bonuses
    const achievementBonus = achievements
      .filter(a => a.unlocked)
      .reduce((sum, a) => sum + a.bonus, 0);

    // Community pool bonus (shared based on staking participation)
    const communityBonus = 0.2; // 20% community pool bonus

    const totalMultiplier = option.multiplier * volumeMultiplier * performanceMultiplier * (1 + platformBonus) * (1 + achievementBonus) * (1 + communityBonus);

    return periodReward * totalMultiplier;
  };

  const getTotalBonusMultiplier = () => {
    const volumeTier = getCurrentVolumeTier(traderMetrics.totalVolume);
    const performanceMultiplier = 1 + (traderMetrics.winRate / 100) * 0.5;
    const platformBonus = Math.min(platformVolume / 10000000, 2);
    const achievementBonus = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.bonus, 0);
    const communityBonus = 0.2;

    return volumeTier.bonusMultiplier * performanceMultiplier * (1 + platformBonus) * (1 + achievementBonus) * (1 + communityBonus);
  };

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPlatformVolume(prev => prev + Math.random() * 1000); // Simulate volume growth
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-2">
          Adaptive Staking Pools
        </h2>
        <p className="text-gray-400">Dynamic rewards based on your performance, platform volume, and community success</p>
      </div>

      {/* My Active Stakes Dashboard */}
      {Array.isArray(userStakes) && userStakes.length > 0 && (
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FiLock className="text-blue-400" />
            My Active Stakes
          </h3>
          <div className="grid gap-4">
            {(userStakes as any[]).map((stake: any, index: number) => {
              if (!stake.active) return null;
              const unlockDate = new Date(Number(stake.startTime + stake.lockPeriod) * 1000);
              const isUnlocked = new Date() >= unlockDate;
              
              return (
                <div key={index} className="bg-gray-800/50 rounded-lg p-4 flex items-center justify-between border border-gray-700">
                  <div>
                    <div className="text-lg font-bold text-white">{formatEther(stake.amount)} NEXUS</div>
                    <div className="text-sm text-gray-400">
                      Unlocks: {unlockDate.toLocaleDateString()} {unlockDate.toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${isUnlocked ? 'text-green-400' : 'text-yellow-400'}`}>
                      {isUnlocked ? 'Unlocked' : 'Locked'}
                    </div>
                    {isUnlocked && (
                      <button className="mt-2 text-xs bg-green-600/20 hover:bg-green-600/40 text-green-400 px-3 py-1 rounded transition-colors">
                        Withdraw & Claim
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Performance Dashboard */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FiBarChart className="text-blue-400" />
          Your Trading Performance
        </h3>

        <div className="grid md:grid-cols-4 gap-4 mb-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-sm text-gray-400">Total Volume</div>
            <div className="text-xl font-bold text-green-400">${traderMetrics.totalVolume.toLocaleString()}</div>
            <div className={`text-sm ${getCurrentVolumeTier(traderMetrics.totalVolume).color}`}>
              {getCurrentVolumeTier(traderMetrics.totalVolume).name} Tier
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-sm text-gray-400">Win Rate</div>
            <div className="text-xl font-bold text-blue-400">{traderMetrics.winRate.toFixed(1)}%</div>
            <div className="text-sm text-gray-400">{traderMetrics.successfulTrades}/{traderMetrics.totalTrades} trades</div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-sm text-gray-400">Total P&L</div>
            <div className={`text-xl font-bold ${traderMetrics.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${traderMetrics.profitLoss.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Net profit</div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-sm text-gray-400">Win Streak</div>
            <div className="text-xl font-bold text-orange-400">{traderMetrics.streak}</div>
            <div className="text-sm text-gray-400">Consecutive wins</div>
          </div>
        </div>

        {/* Achievement Badges */}
        <div className="border-t border-gray-700 pt-4">
          <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <FiAward className="text-yellow-400" />
            Achievements ({achievements.filter(a => a.unlocked).length}/{achievements.length})
          </h4>
          <div className="grid md:grid-cols-5 gap-3">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-3 rounded-lg border text-center transition-all ${
                  achievement.unlocked
                    ? 'border-yellow-500/50 bg-yellow-500/10'
                    : 'border-gray-600 bg-gray-800/30 opacity-50'
                }`}
              >
                <div className="text-2xl mb-1">{achievement.icon}</div>
                <div className="text-sm font-semibold">{achievement.name}</div>
                <div className="text-xs text-gray-400">{achievement.description}</div>
                {achievement.unlocked && (
                  <div className="text-xs text-green-400 mt-1">+{achievement.bonus}x bonus</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Platform Stats */}
      <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FiZap className="text-purple-400" />
          Platform Dynamics
        </h3>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">${platformVolume.toLocaleString()}</div>
            <div className="text-sm text-gray-400">Total Platform Volume</div>
            <div className="text-xs text-green-400 mt-1">+12.5% this week</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{getTotalBonusMultiplier().toFixed(2)}x</div>
            <div className="text-sm text-gray-400">Your Total Multiplier</div>
            <div className="text-xs text-gray-400 mt-1">Performance + Volume + Community</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">2,847</div>
            <div className="text-sm text-gray-400">Active Traders</div>
            <div className="text-xs text-green-400 mt-1">+8.3% this week</div>
          </div>
        </div>
      </div>

      {/* Token Selection */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FiDollarSign className="text-green-400" />
          Select Token to Stake
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { symbol: 'NEXUS', name: 'Nexus Token', icon: '🚀', active: true },
            { symbol: 'ETH', name: 'Ethereum', icon: '⟠', active: false },
            { symbol: 'ARB', name: 'Arbitrum', icon: '🔺', active: false },
            { symbol: 'MATIC', name: 'Polygon', icon: '⬡', active: false },
          ].map((token) => (
            <button
              key={token.symbol}
              onClick={() => token.active && setSelectedToken(token.symbol as any)}
              disabled={!token.active}
              className={`p-4 rounded-lg border-2 transition-all relative ${
                selectedToken === token.symbol
                  ? 'border-blue-500 bg-blue-500/20'
                  : token.active 
                    ? 'border-gray-700 hover:border-gray-600'
                    : 'border-gray-800 bg-gray-900/50 opacity-50 cursor-not-allowed'
              }`}
            >
              {!token.active && (
                <div className="absolute top-2 right-2 text-[10px] bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded">
                  Soon
                </div>
              )}
              <div className="text-2xl mb-2">{token.icon}</div>
              <div className="font-semibold">{token.symbol}</div>
              <div className="text-sm text-gray-400">{token.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Adaptive Staking Options */}
      <div className="grid md:grid-cols-2 gap-6">
        {stakingOptions.map((option) => (
          <div key={option.period} className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold flex items-center gap-2">
                <FiClock className="text-blue-400" />
                {option.period}
              </h4>
              <span className="text-green-400 font-bold">{option.baseApy}% Base APY</span>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Lock Multiplier:</span>
                <span className="text-yellow-400">{option.multiplier}x</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Min Stake:</span>
                <span>{option.minStake} {selectedToken}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Your Total Multiplier:</span>
                <span className="text-purple-400">{(option.multiplier * getTotalBonusMultiplier()).toFixed(2)}x</span>
              </div>
              {stakeAmount && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Est. Adaptive Rewards:</span>
                  <span className="text-green-400 font-bold">
                    +{calculateAdaptiveRewards(parseFloat(stakeAmount) || 0, option).toFixed(2)} {selectedToken}
                  </span>
                </div>
              )}
            </div>

            <button 
              onClick={() => handleStake(option.months)}
              disabled={isStaking || isApproving || !stakeAmount}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiLock />
              {isStaking || isApproving ? 'Processing...' : `Stake for ${option.period}`}
            </button>
          </div>
        ))}
      </div>

      {/* Stake Amount Input */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
        <h3 className="text-xl font-semibold mb-4">Stake Amount</h3>
        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <input
              type="number"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              placeholder={`Enter ${selectedToken} amount`}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
            />
            <button 
              onClick={() => handlePercentageClick(100)}
              className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Max
            </button>
          </div>
          
          {/* Percentage Buttons */}
          <div className="flex gap-2">
            {[25, 50, 75, 100].map((percent) => (
              <button
                key={percent}
                onClick={() => handlePercentageClick(percent)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 py-2 rounded-lg text-sm font-medium transition-colors text-gray-300 hover:text-white"
              >
                {percent}%
              </button>
            ))}
          </div>
        </div>
        <p className="text-sm text-gray-400 mt-2">
          Adaptive rewards scale with your performance, platform success, and community participation!
        </p>
      </div>

      {/* Adaptive Rewards Breakdown */}
      <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 backdrop-blur-sm rounded-xl p-6 border border-green-500/20">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FiTarget className="text-green-400" />
          Adaptive Rewards System
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-semibold text-green-400">Performance Multipliers</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Volume Tier Bonus:</span>
                <span className={getCurrentVolumeTier(traderMetrics.totalVolume).color}>
                  {getCurrentVolumeTier(traderMetrics.totalVolume).bonusMultiplier}x ({getCurrentVolumeTier(traderMetrics.totalVolume).name})
                </span>
              </div>
              <div className="flex justify-between">
                <span>Win Rate Bonus:</span>
                <span className="text-blue-400">{(1 + (traderMetrics.winRate / 100) * 0.5).toFixed(2)}x</span>
              </div>
              <div className="flex justify-between">
                <span>Achievement Bonus:</span>
                <span className="text-yellow-400">{(1 + achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.bonus, 0)).toFixed(2)}x</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-blue-400">Community & Platform</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Platform Volume Bonus:</span>
                <span className="text-purple-400">{(1 + Math.min(platformVolume / 10000000, 2)).toFixed(2)}x</span>
              </div>
              <div className="flex justify-between">
                <span>Community Pool Bonus:</span>
                <span className="text-green-400">1.2x</span>
              </div>
              <div className="flex justify-between">
                <span>Total Adaptive Multiplier:</span>
                <span className="text-orange-400 font-bold">{getTotalBonusMultiplier().toFixed(2)}x</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-gray-800/30 rounded-lg">
          <p className="text-sm text-gray-300">
            <strong>How it works:</strong> Your rewards adapt to your trading success, platform growth, and community participation.
            Higher volume, better win rates, and platform success all increase your staking yields dynamically.
          </p>
        </div>
      </div>
    </div>
  );
}