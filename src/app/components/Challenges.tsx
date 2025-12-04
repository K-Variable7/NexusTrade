'use client';

import { useState, useEffect } from 'react';
import { FiTarget, FiAward, FiClock, FiUsers, FiStar } from 'react-icons/fi';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId, useReadContract, useReadContracts } from 'wagmi';
import { CONTRACT_CONFIGS } from '../../lib/contracts';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'trading_volume' | 'profit_target' | 'streak' | 'social' | 'learning';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  reward: {
    type: 'nft' | 'token' | 'badge' | 'pool_share';
    value: string;
    description: string;
  };
  requirements: string[];
  participants: number;
  timeLeft: string;
  progress: number;
  isActive: boolean;
  endDate: string;
}

export default function Challenges() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [userProgress, setUserProgress] = useState<{ [key: string]: number }>({});

  const { writeContract: joinChallenge, data: joinHash, isPending: isJoining } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isJoined } = useWaitForTransactionReceipt({
    hash: joinHash,
  });

  // Get contract config based on chainId
  // @ts-ignore
  const network = chainId === 111545111 ? 'tenderly' : 'sepolia';
  // @ts-ignore
  const config = CONTRACT_CONFIGS[network]?.Challenge;

  const { data: participantInfo } = useReadContract({
    ...config,
    functionName: 'participants',
    args: [BigInt(selectedChallenge?.id || 0), address as `0x${string}`],
    query: {
      enabled: !!config && !!selectedChallenge && !!address,
    },
  });

  // Fetch joined status for all challenges
  const { data: joinedStatuses } = useReadContracts({
    contracts: challenges.map(c => ({
      ...config,
      functionName: 'participants',
      args: [BigInt(c.id), address as `0x${string}`],
    })),
    query: {
      enabled: !!config && !!address && challenges.length > 0,
    }
  });

  useEffect(() => {
    if (isJoined) {
      alert('Successfully joined the challenge!');
      // Ideally refresh data here
      setSelectedChallenge(null);
    }
  }, [isJoined]);

  const handleJoinChallenge = async (challengeId: string) => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    if (!config) {
      console.error('Contract config not found for network', network);
      alert('Contract not configured for this network');
      return;
    }

    try {
      joinChallenge({
        ...config,
        functionName: 'joinChallenge',
        args: [BigInt(challengeId)],
      });
    } catch (error) {
      console.error('Error joining challenge:', error);
    }
  };

  useEffect(() => {
    // Mock data for trading challenges
    const mockChallenges: Challenge[] = [
      {
        id: '1',
        title: 'Weekly Profit Hunter',
        description: 'Achieve 5% profit on your portfolio within 7 days',
        type: 'profit_target',
        difficulty: 'intermediate',
        reward: {
          type: 'nft',
          value: 'Golden Bull NFT',
          description: 'Exclusive profit hunter badge NFT'
        },
        requirements: [
          'Minimum starting balance: 0.1 ETH',
          'No leverage allowed',
          'Must complete within 7 days'
        ],
        participants: 1247,
        timeLeft: '3 days',
        progress: 65,
        isActive: true,
        endDate: '2024-12-06'
      },
      {
        id: '2',
        title: 'DeFi Explorer',
        description: 'Try 5 different DeFi protocols and earn rewards',
        type: 'learning',
        difficulty: 'beginner',
        reward: {
          type: 'token',
          value: '100 NEXUS',
          description: 'Platform governance tokens'
        },
        requirements: [
          'Interact with 5 different protocols',
          'Minimum $50 volume per protocol',
          'Complete within 14 days'
        ],
        participants: 892,
        timeLeft: '8 days',
        progress: 40,
        isActive: true,
        endDate: '2024-12-11'
      },
      {
        id: '3',
        title: 'Volume Champion',
        description: 'Generate $10,000 in trading volume this month',
        type: 'trading_volume',
        difficulty: 'advanced',
        reward: {
          type: 'pool_share',
          value: '5% Pool Share',
          description: 'Share in community trading pool profits'
        },
        requirements: [
          'Minimum 50 trades',
          'Average trade size: $100+',
          'Complete within 30 days'
        ],
        participants: 456,
        timeLeft: '18 days',
        progress: 78,
        isActive: true,
        endDate: '2024-12-21'
      },
      {
        id: '4',
        title: 'Social Trader',
        description: 'Share 10 successful trades and help the community',
        type: 'social',
        difficulty: 'beginner',
        reward: {
          type: 'badge',
          value: 'Community Leader',
          description: 'Special recognition badge'
        },
        requirements: [
          'Share profitable trades only',
          'Include strategy reasoning',
          'Get 5 upvotes per share'
        ],
        participants: 2156,
        timeLeft: '12 days',
        progress: 25,
        isActive: true,
        endDate: '2024-12-15'
      },
      {
        id: '5',
        title: 'Streak Master',
        description: 'Maintain a 10-day profitable streak',
        type: 'streak',
        difficulty: 'expert',
        reward: {
          type: 'nft',
          value: 'Diamond Hands NFT',
          description: 'Rare collection NFT for consistent traders'
        },
        requirements: [
          '10 consecutive profitable days',
          'Minimum $25 profit per day',
          'No losses allowed in streak'
        ],
        participants: 234,
        timeLeft: '6 days',
        progress: 90,
        isActive: true,
        endDate: '2024-12-09'
      }
    ];

    setChallenges(mockChallenges);

    // Mock user progress
    setUserProgress({
      '1': 65,
      '2': 40,
      '3': 78,
      '4': 25,
      '5': 90
    });
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400 bg-green-900/20';
      case 'intermediate': return 'text-blue-400 bg-blue-900/20';
      case 'advanced': return 'text-orange-400 bg-orange-900/20';
      case 'expert': return 'text-red-400 bg-red-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'profit_target': return '💰';
      case 'trading_volume': return '📊';
      case 'streak': return '🔥';
      case 'social': return '👥';
      case 'learning': return '🎓';
      default: return '🎯';
    }
  };

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'nft': return '🎨';
      case 'token': return '🪙';
      case 'badge': return '🏆';
      case 'pool_share': return '💎';
      default: return '🎁';
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-md p-6 rounded-xl border border-white/10 shadow-lg hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:border-white/20 group">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <FiTarget className="text-purple-400 text-3xl mr-3 group-hover:text-purple-300 transition-colors duration-300" />
          <h2 className="text-xl font-medium text-white group-hover:text-purple-100 transition-colors duration-300">Trading Challenges</h2>
        </div>
        <div className="flex items-center space-x-2">
          <FiAward className="text-yellow-400" />
          <span className="text-yellow-400 text-sm font-medium">Top 10% Complete</span>
        </div>
      </div>

      <div className="space-y-4">
        {challenges.map((challenge) => (
          <div
            key={challenge.id}
            className="bg-slate-900/30 p-4 rounded-lg border border-purple-400/10 hover:bg-slate-900/50 transition-colors duration-200 cursor-pointer"
            onClick={() => setSelectedChallenge(challenge)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-3">{getTypeIcon(challenge.type)}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-medium">{challenge.title}</h3>
                    {joinedStatuses && joinedStatuses[challenges.indexOf(challenge)]?.result && (joinedStatuses[challenges.indexOf(challenge)].result as any)[0] && (
                      <span className="bg-green-500/20 text-green-400 text-[10px] px-2 py-0.5 rounded-full border border-green-500/30 font-medium">
                        JOINED
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(challenge.difficulty)}`}>
                      {challenge.difficulty.toUpperCase()}
                    </span>
                    <span className="text-gray-400 text-xs flex items-center">
                      <FiClock className="mr-1" />
                      {challenge.timeLeft} left
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center text-yellow-400 mb-1">
                  <span className="text-lg mr-1">{getRewardIcon(challenge.reward.type)}</span>
                  <span className="text-sm font-medium">{challenge.reward.value}</span>
                </div>
                <div className="text-xs text-gray-500">{challenge.reward.description}</div>
              </div>
            </div>

            <p className="text-gray-400 text-sm mb-3 line-clamp-2">{challenge.description}</p>

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span className="flex items-center">
                  <FiUsers className="mr-1" />
                  {challenge.participants.toLocaleString()}
                </span>
                <span className="flex items-center">
                  <FiStar className="mr-1" />
                  {userProgress[challenge.id] || 0}% complete
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-purple-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${userProgress[challenge.id] || 0}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 text-right">
              {userProgress[challenge.id] || 0}% complete
            </div>
          </div>
        ))}
      </div>

      {/* Challenge Details Modal */}
      {selectedChallenge && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 p-6 rounded-xl border border-white/20 max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <span className="text-3xl mr-3">{getTypeIcon(selectedChallenge.type)}</span>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedChallenge.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ml-2 ${getDifficultyColor(selectedChallenge.difficulty)}`}>
                    {selectedChallenge.difficulty.toUpperCase()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedChallenge(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-gray-300">{selectedChallenge.description}</p>

              {/* Reward Section */}
              <div className="bg-purple-900/20 border border-purple-400/20 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">{getRewardIcon(selectedChallenge.reward.type)}</span>
                  <span className="text-purple-400 font-medium">Reward: {selectedChallenge.reward.value}</span>
                </div>
                <p className="text-gray-300 text-sm">{selectedChallenge.reward.description}</p>
              </div>

              {/* Requirements */}
              <div>
                <h4 className="text-white font-medium mb-2">Requirements:</h4>
                <ul className="space-y-1">
                  {selectedChallenge.requirements.map((req, index) => (
                    <li key={index} className="text-gray-300 text-sm flex items-start">
                      <span className="text-purple-400 mr-2">•</span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">Your Progress</span>
                  <span className="text-purple-400">{userProgress[selectedChallenge.id] || 0}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-purple-400 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${userProgress[selectedChallenge.id] || 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
                <div>
                  <div className="text-gray-400 text-sm">Participants</div>
                  <div className="text-white font-bold flex items-center">
                    <FiUsers className="mr-1" />
                    {selectedChallenge.participants.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Time Left</div>
                  <div className="text-white font-bold flex items-center">
                    <FiClock className="mr-1" />
                    {selectedChallenge.timeLeft}
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button 
                  onClick={() => handleJoinChallenge(selectedChallenge.id)}
                  disabled={isJoining || isConfirming || (participantInfo && (participantInfo as any)[0])}
                  className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {participantInfo && (participantInfo as any)[0] ? 'Joined' : isJoining ? 'Confirming...' : isConfirming ? 'Joining...' : 'Join Challenge'}
                </button>
                <button className="flex-1 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-500 transition-colors font-medium">
                  View Leaderboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}