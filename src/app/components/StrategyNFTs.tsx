'use client';

import { useState, useEffect } from 'react';
import { FiZap, FiShoppingCart, FiHeart, FiEye, FiStar, FiTrendingUp, FiAward, FiTarget } from 'react-icons/fi';

interface TierCard {
  id: string;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  name: string;
  description: string;
  owner: string;
  ownerName: string;
  performance: number;
  volume: number;
  winRate: number;
  achievements: string[];
  createdAt: string;
  level: number;
  rarity: number; // 1-100
  attributes: {
    totalTrades: number;
    bestStreak: number;
    totalPnL: number;
    avgProfit: number;
  };
}

const tierConfig = {
  Bronze: {
    color: '#CD7F32',
    bgGradient: 'linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)',
    borderColor: '#A0522D',
    glowColor: 'rgba(205, 127, 50, 0.3)',
    icon: '🥉',
    baseValue: 0.1,
    multiplier: 1.0
  },
  Silver: {
    color: '#C0C0C0',
    bgGradient: 'linear-gradient(135deg, #C0C0C0 0%, #808080 100%)',
    borderColor: '#A8A8A8',
    glowColor: 'rgba(192, 192, 192, 0.3)',
    icon: '🥈',
    baseValue: 0.25,
    multiplier: 1.5
  },
  Gold: {
    color: '#FFD700',
    bgGradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
    borderColor: '#DAA520',
    glowColor: 'rgba(255, 215, 0, 0.4)',
    icon: '🥇',
    baseValue: 0.5,
    multiplier: 2.0
  },
  Platinum: {
    color: '#E5E4E2',
    bgGradient: 'linear-gradient(135deg, #E5E4E2 0%, #B8B8B8 100%)',
    borderColor: '#C0C0C0',
    glowColor: 'rgba(229, 228, 226, 0.4)',
    icon: '💎',
    baseValue: 1.0,
    multiplier: 3.0
  },
  Diamond: {
    color: '#B9F2FF',
    bgGradient: 'linear-gradient(135deg, #B9F2FF 0%, #4FC3F7 100%)',
    borderColor: '#81D4FA',
    glowColor: 'rgba(185, 242, 255, 0.5)',
    icon: '💎',
    baseValue: 2.0,
    multiplier: 5.0
  }
};

function generateTierCardSVG(card: TierCard): string {
  const config = tierConfig[card.tier];
  const width = 400;
  const height = 600;

  return `
    <svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <!-- Card Background with Gradient -->
      <defs>
        <linearGradient id="cardBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${config.color};stop-opacity:0.9" />
          <stop offset="100%" style="stop-color:${config.color};stop-opacity:0.6" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <!-- Main Card Body -->
      <rect x="20" y="20" width="360" height="560" rx="20" ry="20" fill="url(#cardBg)" stroke="${config.borderColor}" stroke-width="3" filter="url(#glow)"/>

      <!-- Tier Icon and Badge -->
      <circle cx="200" cy="80" r="35" fill="${config.color}" opacity="0.8"/>
      <text x="200" y="95" font-family="Arial, sans-serif" font-size="32" text-anchor="middle" fill="white">${config.icon}</text>

      <!-- Tier Name -->
      <text x="200" y="140" font-family="Arial, sans-serif" font-size="28" font-weight="bold" text-anchor="middle" fill="white">${card.tier}</text>

      <!-- Card Name -->
      <text x="200" y="170" font-family="Arial, sans-serif" font-size="18" text-anchor="middle" fill="white" opacity="0.9">${card.name}</text>

      <!-- Performance Stats -->
      <rect x="40" y="200" width="320" height="120" rx="10" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>

      <text x="60" y="225" font-family="Arial, sans-serif" font-size="14" fill="white">Performance:</text>
      <text x="320" y="225" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="end" fill="${config.color}">+${card.performance.toFixed(1)}%</text>

      <text x="60" y="250" font-family="Arial, sans-serif" font-size="14" fill="white">Win Rate:</text>
      <text x="320" y="250" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="end" fill="${config.color}">${card.winRate.toFixed(1)}%</text>

      <text x="60" y="275" font-family="Arial, sans-serif" font-size="14" fill="white">Volume:</text>
      <text x="320" y="275" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="end" fill="${config.color}">$${card.volume.toLocaleString()}</text>

      <text x="60" y="300" font-family="Arial, sans-serif" font-size="14" fill="white">Level:</text>
      <text x="320" y="300" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="end" fill="${config.color}">${card.level}</text>

      <!-- Achievement Badges -->
      <text x="200" y="340" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="white">Achievements</text>

      ${card.achievements.slice(0, 3).map((achievement, index) => `
        <circle cx="${120 + index * 60}" cy="370" r="15" fill="${config.color}" opacity="0.7"/>
        <text x="${120 + index * 60}" y="378" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="white">${achievement.slice(0, 2)}</text>
      `).join('')}

      <!-- Attributes Section -->
      <rect x="40" y="400" width="320" height="140" rx="10" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>

      <text x="200" y="425" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="white">Trading Stats</text>

      <text x="60" y="450" font-family="Arial, sans-serif" font-size="12" fill="white">Total Trades:</text>
      <text x="320" y="450" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="end" fill="${config.color}">${card.attributes.totalTrades}</text>

      <text x="60" y="470" font-family="Arial, sans-serif" font-size="12" fill="white">Best Streak:</text>
      <text x="320" y="470" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="end" fill="${config.color}">${card.attributes.bestStreak}</text>

      <text x="60" y="490" font-family="Arial, sans-serif" font-size="12" fill="white">Total P&L:</text>
      <text x="320" y="490" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="end" fill="${config.color}">$${card.attributes.totalPnL.toLocaleString()}</text>

      <text x="60" y="510" font-family="Arial, sans-serif" font-size="12" fill="white">Avg Profit:</text>
      <text x="320" y="510" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="end" fill="${config.color}">$${card.attributes.avgProfit.toFixed(2)}</text>

      <!-- Rarity Indicator -->
      <rect x="40" y="550" width="${(card.rarity / 100) * 320}" height="8" rx="4" fill="${config.color}" opacity="0.8"/>
      <text x="200" y="575" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="white" opacity="0.7">Rarity: ${card.rarity}/100</text>

      <!-- Owner Info -->
      <text x="200" y="590" font-family="Arial, sans-serif" font-size="10" text-anchor="middle" fill="white" opacity="0.5">${card.ownerName}</text>
    </svg>
  `.trim();
}

export default function StrategyNFTs() {
  const [cards, setCards] = useState<TierCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<TierCard | null>(null);
  const [filter, setFilter] = useState<'all' | 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond'>('all');
  const [sortBy, setSortBy] = useState<'rarity' | 'performance' | 'level'>('rarity');

  useEffect(() => {
    // Generate tier-based cards
    const mockCards: TierCard[] = [
      {
        id: '1',
        tier: 'Bronze',
        name: 'Rising Trader',
        description: 'Entry-level trading card for newcomers to the platform',
        owner: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        ownerName: 'NewTrader2025',
        performance: 12.5,
        volume: 25000,
        winRate: 45.2,
        achievements: ['First Trade', 'Consistent'],
        createdAt: '2025-12-01',
        level: 5,
        rarity: 15,
        attributes: {
          totalTrades: 67,
          bestStreak: 3,
          totalPnL: 3125,
          avgProfit: 46.64
        }
      },
      {
        id: '2',
        tier: 'Silver',
        name: 'Skilled Trader',
        description: 'Intermediate trader with proven track record',
        owner: '0x8ba1f109551bD432803012645261768374161',
        ownerName: 'TradeMaster',
        performance: 67.8,
        volume: 125000,
        winRate: 62.4,
        achievements: ['Hot Streak', 'Volume Champion', 'Consistent'],
        createdAt: '2025-11-15',
        level: 12,
        rarity: 42,
        attributes: {
          totalTrades: 234,
          bestStreak: 8,
          totalPnL: 84750,
          avgProfit: 362.18
        }
      },
      {
        id: '3',
        tier: 'Gold',
        name: 'Elite Trader',
        description: 'High-performance trader with exceptional results',
        owner: '0x4a2d35Cc6634C0532925a3b844Bc454e4438f44f',
        ownerName: 'ProfitKing',
        performance: 156.7,
        volume: 500000,
        winRate: 78.5,
        achievements: ['Profit Master', 'Volume Champion', 'Hot Streak', 'Legend'],
        createdAt: '2025-10-20',
        level: 25,
        rarity: 78,
        attributes: {
          totalTrades: 567,
          bestStreak: 15,
          totalPnL: 783500,
          avgProfit: 1381.13
        }
      },
      {
        id: '4',
        tier: 'Platinum',
        name: 'Master Trader',
        description: 'Elite trader with mastery over multiple strategies',
        owner: '0x9c3d35Cc6634C0532925a3b844Bc454e4438f45a',
        ownerName: 'StrategyGod',
        performance: 234.8,
        volume: 2000000,
        winRate: 85.3,
        achievements: ['Profit Master', 'Volume Champion', 'Hot Streak', 'Legend', 'Master'],
        createdAt: '2025-09-10',
        level: 40,
        rarity: 92,
        attributes: {
          totalTrades: 1234,
          bestStreak: 28,
          totalPnL: 4696000,
          avgProfit: 3802.59
        }
      },
      {
        id: '5',
        tier: 'Diamond',
        name: 'Legendary Trader',
        description: 'Ultimate trading legend with unmatched performance',
        owner: '0x3b4d35Cc6634C0532925a3b844Bc454e4438f46b',
        ownerName: 'DiamondHands',
        performance: 412.3,
        volume: 5000000,
        winRate: 92.1,
        achievements: ['Profit Master', 'Volume Champion', 'Hot Streak', 'Legend', 'Master', 'Diamond'],
        createdAt: '2025-08-01',
        level: 60,
        rarity: 98,
        attributes: {
          totalTrades: 2567,
          bestStreak: 45,
          totalPnL: 20615000,
          avgProfit: 8033.66
        }
      }
    ];

    setCards(mockCards);
  }, []);

  const filteredCards = cards.filter(card =>
    filter === 'all' || card.tier === filter
  );

  const sortedCards = [...filteredCards].sort((a, b) => {
    switch (sortBy) {
      case 'rarity':
        return b.rarity - a.rarity;
      case 'performance':
        return b.performance - a.performance;
      case 'level':
        return b.level - a.level;
      default:
        return 0;
    }
  });

  const getTierColor = (tier: string) => {
    return tierConfig[tier as keyof typeof tierConfig]?.color || '#666';
  };

  const getTierIcon = (tier: string) => {
    return tierConfig[tier as keyof typeof tierConfig]?.icon || '🎴';
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-2">
          Tier Trading Cards
        </h2>
        <p className="text-gray-400">On-chain generated tier cards representing your trading achievements</p>
      </div>

      {/* Filters and Sorting */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
            >
              <option value="all">All Tiers</option>
              <option value="Bronze">Bronze</option>
              <option value="Silver">Silver</option>
              <option value="Gold">Gold</option>
              <option value="Platinum">Platinum</option>
              <option value="Diamond">Diamond</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
            >
              <option value="rarity">Sort by Rarity</option>
              <option value="performance">Sort by Performance</option>
              <option value="level">Sort by Level</option>
            </select>
          </div>

          <div className="text-sm text-gray-400">
            Showing {sortedCards.length} cards
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedCards.map((card) => (
          <div
            key={card.id}
            onClick={() => setSelectedCard(card)}
            className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 overflow-hidden cursor-pointer hover:border-gray-700 transition-all duration-300 hover:scale-105"
            style={{
              boxShadow: `0 0 20px ${tierConfig[card.tier].glowColor}`
            }}
          >
            {/* Card Preview */}
            <div className="aspect-[2/3] bg-gray-800 flex items-center justify-center relative overflow-hidden group">
              <div
                className="w-full h-full transform group-hover:scale-110 transition-transform duration-500"
                dangerouslySetInnerHTML={{
                  __html: generateTierCardSVG(card)
                }}
              />
            </div>

            {/* Card Info */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-white">{card.name}</h3>
                <div className="flex items-center gap-1">
                  <FiStar className="text-yellow-400" />
                  <span className="text-sm text-gray-400">{card.rarity}/100</span>
                </div>
              </div>

              <p className="text-sm text-gray-400 mb-3 line-clamp-2">{card.description}</p>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <FiEye className="text-gray-400" />
                  <span className="text-gray-400">{card.attributes.totalTrades}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiTrendingUp className="text-gray-400" />
                  <span className="text-gray-400">${card.volume.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                {card.achievements.slice(0, 2).map((achievement, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-300"
                  >
                    {achievement}
                  </span>
                ))}
                {card.achievements.length > 2 && (
                  <span className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-300">
                    +{card.achievements.length - 2}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Card Detail Modal */}
      {selectedCard && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">{selectedCard.name}</h3>
                <button
                  onClick={() => setSelectedCard(null)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* SVG Card Display */}
                <div className="flex justify-center">
                  <div
                    className="w-80 h-auto rounded-lg overflow-hidden"
                    style={{
                      boxShadow: `0 0 30px ${tierConfig[selectedCard.tier].glowColor}`
                    }}
                    dangerouslySetInnerHTML={{
                      __html: generateTierCardSVG(selectedCard)
                    }}
                  />
                </div>

                {/* Card Details */}
                <div className="space-y-4">
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <FiTarget className="text-blue-400" />
                      Card Statistics
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Tier:</span>
                        <span style={{ color: getTierColor(selectedCard.tier) }} className="font-semibold">
                          {selectedCard.tier} {getTierIcon(selectedCard.tier)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Level:</span>
                        <span className="text-white font-semibold">{selectedCard.level}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Rarity:</span>
                        <span className="text-yellow-400 font-semibold">{selectedCard.rarity}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Performance:</span>
                        <span className="text-green-400 font-semibold">+{selectedCard.performance.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Win Rate:</span>
                        <span className="text-blue-400 font-semibold">{selectedCard.winRate.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Trading Volume:</span>
                        <span className="text-purple-400 font-semibold">${selectedCard.volume.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <FiAward className="text-yellow-400" />
                      Achievements ({selectedCard.achievements.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCard.achievements.map((achievement, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium"
                        >
                          {achievement}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-3">Trading Attributes</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-400">Total Trades</div>
                        <div className="text-white font-semibold">{selectedCard.attributes.totalTrades}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Best Streak</div>
                        <div className="text-white font-semibold">{selectedCard.attributes.bestStreak}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Total P&L</div>
                        <div className="text-green-400 font-semibold">${selectedCard.attributes.totalPnL.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Avg Profit</div>
                        <div className="text-blue-400 font-semibold">${selectedCard.attributes.avgProfit.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400">Owner:</span>
                      <span className="text-white font-mono text-sm">{selectedCard.ownerName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Created:</span>
                      <span className="text-white text-sm">{new Date(selectedCard.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2">
                      <FiShoppingCart />
                      List for Sale
                    </button>
                    <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2">
                      <FiHeart />
                      Favorite
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tier Information */}
      <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FiStar className="text-yellow-400" />
          Tier System
        </h3>

        <div className="grid md:grid-cols-5 gap-4">
          {Object.entries(tierConfig).map(([tier, config]) => (
            <div
              key={tier}
              className="text-center p-4 rounded-lg border"
              style={{
                background: config.bgGradient,
                borderColor: config.borderColor,
                boxShadow: `0 0 15px ${config.glowColor}`
              }}
            >
              <div className="text-3xl mb-2">{config.icon}</div>
              <div className="font-bold text-white mb-1">{tier}</div>
              <div className="text-sm text-white/80 mb-2">{config.multiplier}x Multiplier</div>
              <div className="text-xs text-white/60">Base: {config.baseValue} ETH</div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-sm text-gray-400 text-center">
          Cards are computer-generated on-chain with no external dependencies. Upgrade tiers by improving your trading performance!
        </div>
      </div>
    </div>
  );
}