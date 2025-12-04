'use client';

import { useState, useEffect } from 'react';
import { FiShield, FiKey, FiStar, FiZap, FiLock, FiUnlock, FiAward, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseEther } from 'viem';

const ACCESS_NFT_ADDRESS = '0xe97244A55B0F017B454a8170030189A649E97C91';
const ACCESS_NFT_ABI = [
  {
    "inputs": [],
    "name": "mint",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MAX_SUPPLY",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MINT_PRICE",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "whitelist",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "whitelistActive",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  }
];

interface AccessNFT {
  id: string;
  tier: 'Basic' | 'Premium' | 'VIP' | 'Elite' | 'Legendary';
  accessLevel: number;
  holderName: string;
  holderAddress: string;
  issuedDate: string;
  expiryDate: string;
  features: string[];
  hologramId: string;
  securityCode: string;
  isActive: boolean;
}

const accessConfig = {
  Basic: {
    color: '#4FC3F7',
    hologramColor: 'linear-gradient(45deg, #4FC3F7, #29B6F6, #03A9F4)',
    borderColor: '#0288D1',
    glowColor: 'rgba(79, 195, 247, 0.6)',
    icon: '🔑',
    features: ['Basic Analytics', 'Community Access', 'Standard Support']
  },
  Premium: {
    color: '#AB47BC',
    hologramColor: 'linear-gradient(45deg, #AB47BC, #9C27B0, #8E24AA)',
    borderColor: '#7B1FA2',
    glowColor: 'rgba(171, 71, 188, 0.6)',
    icon: '💎',
    features: ['Advanced Analytics', 'Priority Support', 'VIP Community', 'Early Access']
  },
  VIP: {
    color: '#FF9800',
    hologramColor: 'linear-gradient(45deg, #FF9800, #FB8C00, #F57C00)',
    borderColor: '#EF6C00',
    glowColor: 'rgba(255, 152, 0, 0.7)',
    icon: '👑',
    features: ['Real-time Alerts', 'Custom Strategies', 'Direct Support', 'Beta Features', 'Exclusive Events']
  },
  Elite: {
    color: '#E91E63',
    hologramColor: 'linear-gradient(45deg, #E91E63, #D81B60, #C2185B)',
    borderColor: '#AD1457',
    glowColor: 'rgba(233, 30, 99, 0.7)',
    icon: '🏆',
    features: ['All VIP Features', 'Strategy Consulting', 'Custom Development', 'Private Events', 'Governance Rights']
  },
  Legendary: {
    color: '#00BCD4',
    hologramColor: 'linear-gradient(45deg, #00BCD4, #00ACC1, #0097A7)',
    borderColor: '#00838F',
    glowColor: 'rgba(0, 188, 212, 0.8)',
    icon: '🌟',
    features: ['All Elite Features', 'Co-development Rights', 'Revenue Sharing', 'Platform Influence', 'Legendary Status']
  }
};

function generateHolographicAccessCard(accessNFT: AccessNFT): string {
  const config = accessConfig[accessNFT.tier];
  const width = 400;
  const height = 600;

  // Generate unique holographic pattern
  const patternId = `holo-${accessNFT.id}`;

  return `
    <svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <!-- Holographic Background Effects -->
      <defs>
        <!-- Rainbow Hologram Gradient -->
        <linearGradient id="${patternId}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#FF6B6B;stop-opacity:0.8" />
          <stop offset="16%" style="stop-color:#4ECDC4;stop-opacity:0.8" />
          <stop offset="33%" style="stop-color:#45B7D1;stop-opacity:0.8" />
          <stop offset="50%" style="stop-color:#96CEB4;stop-opacity:0.8" />
          <stop offset="66%" style="stop-color:#FFEAA7;stop-opacity:0.8" />
          <stop offset="83%" style="stop-color:#DDA0DD;stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:#FF6B6B;stop-opacity:0.8" />
        </linearGradient>

        <!-- Shimmer Effect -->
        <linearGradient id="shimmer-${patternId}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:rgba(255,255,255,0);stop-opacity:0" />
          <stop offset="50%" style="stop-color:rgba(255,255,255,0.8);stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:rgba(255,255,255,0);stop-opacity:0" />
        </linearGradient>

        <!-- Holographic Interference Pattern -->
        <pattern id="interference-${patternId}" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="20" height="20" fill="none"/>
          <path d="M0,10 Q5,5 10,10 T20,10" stroke="url(#${patternId})" stroke-width="0.5" fill="none" opacity="0.3"/>
          <path d="M0,15 Q5,10 10,15 T20,15" stroke="url(#${patternId})" stroke-width="0.5" fill="none" opacity="0.2"/>
        </pattern>

        <!-- Glow Filter -->
        <filter id="glow-${patternId}">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

        <!-- Metallic Effect -->
        <linearGradient id="metallic-${patternId}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#FFFFFF;stop-opacity:0.9" />
          <stop offset="30%" style="stop-color:#E0E0E0;stop-opacity:0.7" />
          <stop offset="70%" style="stop-color:#B0B0B0;stop-opacity:0.5" />
          <stop offset="100%" style="stop-color:#808080;stop-opacity:0.3" />
        </linearGradient>
      </defs>

      <!-- Main Card Body with Holographic Effect -->
      <rect x="20" y="20" width="360" height="560" rx="25" ry="25" fill="url(#metallic-${patternId})" stroke="url(#${patternId})" stroke-width="2" filter="url(#glow-${patternId})"/>

      <!-- Holographic Interference Overlay -->
      <rect x="20" y="20" width="360" height="560" rx="25" ry="25" fill="url(#interference-${patternId})" opacity="0.4"/>

      <!-- Shimmer Effect -->
      <rect x="20" y="20" width="360" height="560" rx="25" ry="25" fill="url(#shimmer-${patternId})" opacity="0.6"/>

      <!-- Access Level Badge -->
      <circle cx="200" cy="90" r="40" fill="url(#${patternId})" opacity="0.9"/>
      <circle cx="200" cy="90" r="35" fill="none" stroke="url(#metallic-${patternId})" stroke-width="2"/>
      <text x="200" y="105" font-family="Arial, sans-serif" font-size="36" text-anchor="middle" fill="white">${config.icon}</text>

      <!-- Tier Name with Holographic Effect -->
      <text x="200" y="150" font-family="Arial, sans-serif" font-size="32" font-weight="bold" text-anchor="middle" fill="url(#${patternId})" filter="url(#glow-${patternId})">${accessNFT.tier}</text>
      <text x="200" y="175" font-family="Arial, sans-serif" font-size="18" text-anchor="middle" fill="white" opacity="0.9">ACCESS PASS</text>

      <!-- Security Hologram -->
      <rect x="50" y="200" width="300" height="80" rx="10" fill="rgba(255,255,255,0.1)" stroke="url(#${patternId})" stroke-width="1"/>
      <text x="70" y="225" font-family="monospace" font-size="12" fill="white">HOLOGRAM ID:</text>
      <text x="70" y="245" font-family="monospace" font-size="14" font-weight="bold" fill="url(#${patternId})">${accessNFT.hologramId}</text>
      <text x="70" y="265" font-family="monospace" font-size="12" fill="white">SECURITY CODE:</text>
      <text x="70" y="280" font-family="monospace" font-size="10" fill="url(#${patternId})">${accessNFT.securityCode}</text>

      <!-- Access Features -->
      <text x="200" y="320" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="white">ACCESS FEATURES</text>

      ${config.features.map((feature, index) => `
        <circle cx="60" cy="${350 + index * 25}" r="8" fill="url(#${patternId})" opacity="0.8"/>
        <text x="80" y="${358 + index * 25}" font-family="Arial, sans-serif" font-size="12" fill="white">${feature}</text>
      `).join('')}

      <!-- Validity Period -->
      <rect x="50" y="480" width="300" height="60" rx="8" fill="rgba(255,255,255,0.1)" stroke="url(#${patternId})" stroke-width="1"/>
      <text x="70" y="500" font-family="Arial, sans-serif" font-size="12" fill="white">ISSUED:</text>
      <text x="130" y="500" font-family="Arial, sans-serif" font-size="12" fill="url(#${patternId})">${new Date(accessNFT.issuedDate).toLocaleDateString()}</text>
      <text x="70" y="520" font-family="Arial, sans-serif" font-size="12" fill="white">EXPIRES:</text>
      <text x="130" y="520" font-family="Arial, sans-serif" font-size="12" fill="${accessNFT.isActive ? 'url(#' + patternId + ')' : '#FF6B6B'}">${new Date(accessNFT.expiryDate).toLocaleDateString()}</text>
      <text x="280" y="510" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="${accessNFT.isActive ? 'url(#' + patternId + ')' : '#FF6B6B'}">${accessNFT.isActive ? 'ACTIVE' : 'EXPIRED'}</text>

      <!-- Holder Information -->
      <text x="200" y="555" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="white" opacity="0.7">HOLDER: ${accessNFT.holderName}</text>
      <text x="200" y="570" font-family="monospace" font-size="8" text-anchor="middle" fill="white" opacity="0.5">${accessNFT.holderAddress.slice(0, 20)}...</text>

      <!-- Access Level Indicator -->
      <rect x="50" y="575" width="${(accessNFT.accessLevel / 100) * 300}" height="6" rx="3" fill="url(#${patternId})" opacity="0.8"/>
      <text x="200" y="590" font-family="Arial, sans-serif" font-size="10" text-anchor="middle" fill="white" opacity="0.6">ACCESS LEVEL: ${accessNFT.accessLevel}/100</text>
    </svg>
  `.trim();
}

export default function AccessNFTs() {
  const [accessNFTs, setAccessNFTs] = useState<AccessNFT[]>([]);
  const [selectedNFT, setSelectedNFT] = useState<AccessNFT | null>(null);
  const [filter, setFilter] = useState<'all' | 'Basic' | 'Premium' | 'VIP' | 'Elite' | 'Legendary'>('all');

  const { address } = useAccount();
  const { writeContract, isPending, data: hash, error: mintError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const { data: totalSupply } = useReadContract({
    address: ACCESS_NFT_ADDRESS as `0x${string}`,
    abi: ACCESS_NFT_ABI,
    functionName: 'totalSupply',
  });

  const { data: isWhitelisted } = useReadContract({
    address: ACCESS_NFT_ADDRESS as `0x${string}`,
    abi: ACCESS_NFT_ABI,
    functionName: 'whitelist',
    args: [address],
    query: {
      enabled: !!address,
    }
  });

  const { data: whitelistActive } = useReadContract({
    address: ACCESS_NFT_ADDRESS as `0x${string}`,
    abi: ACCESS_NFT_ABI,
    functionName: 'whitelistActive',
  });

  const handleMint = () => {
    if (whitelistActive && !isWhitelisted) return;
    
    writeContract({
      address: ACCESS_NFT_ADDRESS as `0x${string}`,
      abi: ACCESS_NFT_ABI,
      functionName: 'mint',
      value: parseEther('0.1'),
    });
  };

  useEffect(() => {
    // Generate holographic access NFTs
    const mockAccessNFTs: AccessNFT[] = [
      {
        id: '1',
        tier: 'Basic',
        accessLevel: 25,
        holderName: 'Alex Thompson',
        holderAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        issuedDate: '2025-01-15',
        expiryDate: '2026-01-15',
        features: ['Basic Analytics', 'Community Access', 'Standard Support'],
        hologramId: 'HOLO-2025-001',
        securityCode: 'NXTR-47F2-9K8L',
        isActive: true
      },
      {
        id: '2',
        tier: 'Premium',
        accessLevel: 60,
        holderName: 'Sarah Chen',
        holderAddress: '0x8ba1f109551bD432803012645261768374161',
        issuedDate: '2025-02-20',
        expiryDate: '2026-02-20',
        features: ['Advanced Analytics', 'Priority Support', 'VIP Community', 'Early Access'],
        hologramId: 'HOLO-2025-042',
        securityCode: 'NXTR-8M3P-2Q7R',
        isActive: true
      },
      {
        id: '3',
        tier: 'VIP',
        accessLevel: 85,
        holderName: 'Marcus Rodriguez',
        holderAddress: '0x4a2d35Cc6634C0532925a3b844Bc454e4438f44f',
        issuedDate: '2025-03-10',
        expiryDate: '2026-03-10',
        features: ['Real-time Alerts', 'Custom Strategies', 'Direct Support', 'Beta Features', 'Exclusive Events'],
        hologramId: 'HOLO-2025-089',
        securityCode: 'NXTR-1T5Y-6U9O',
        isActive: true
      },
      {
        id: '4',
        tier: 'Elite',
        accessLevel: 95,
        holderName: 'Emma Watson',
        holderAddress: '0x9c3d35Cc6634C0532925a3b844Bc454e4438f45a',
        issuedDate: '2025-04-05',
        expiryDate: '2026-04-05',
        features: ['All VIP Features', 'Strategy Consulting', 'Custom Development', 'Private Events', 'Governance Rights'],
        hologramId: 'HOLO-2025-156',
        securityCode: 'NXTR-4V8B-3N2M',
        isActive: true
      },
      {
        id: '5',
        tier: 'Legendary',
        accessLevel: 100,
        holderName: 'David Kim',
        holderAddress: '0x3b4d35Cc6634C0532925a3b844Bc454e4438f46b',
        issuedDate: '2025-05-01',
        expiryDate: '2026-05-01',
        features: ['All Elite Features', 'Co-development Rights', 'Revenue Sharing', 'Platform Influence', 'Legendary Status'],
        hologramId: 'HOLO-2025-201',
        securityCode: 'NXTR-7W4X-5Z0P',
        isActive: true
      }
    ];

    setAccessNFTs(mockAccessNFTs);
  }, []);

  const filteredNFTs = accessNFTs.filter(nft =>
    filter === 'all' || nft.tier === filter
  );

  const getTierColor = (tier: string) => {
    return accessConfig[tier as keyof typeof accessConfig]?.color || '#666';
  };

  const getTierIcon = (tier: string) => {
    return accessConfig[tier as keyof typeof accessConfig]?.icon || '🔑';
  };

  return (
    <div className="space-y-6">
      {/* Minting Section */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-8 border border-purple-500/30 shadow-lg shadow-purple-500/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold border border-purple-500/30">
                LIMITED EDITION
              </span>
              <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold border border-cyan-500/30">
                OG ACCESS
              </span>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Mint Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">OG Access Pass</span>
            </h2>
            <p className="text-gray-300 mb-6 max-w-xl">
              Join the elite circle of early adopters. The OG Access Pass grants you exclusive benefits, 
              revenue sharing opportunities, and governance rights in the GovBlockTrade ecosystem.
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <div className="text-gray-400 text-sm mb-1">Price</div>
                <div className="text-2xl font-bold text-white">0.1 ETH</div>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <div className="text-gray-400 text-sm mb-1">Total Minted</div>
                <div className="text-2xl font-bold text-white">{totalSupply ? totalSupply.toString() : '0'} / 1000</div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {whitelistActive && !isWhitelisted ? (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-center">
                  <div className="text-yellow-400 font-bold mb-2 flex items-center justify-center gap-2">
                    <FiLock /> Whitelist Active
                  </div>
                  <p className="text-gray-300 text-sm mb-3">
                    This phase is restricted to whitelisted addresses only.
                  </p>
                  <a 
                    href="https://discord.gg/nexustrade" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-yellow-400 hover:text-yellow-300 text-sm font-medium underline"
                  >
                    Join the Whitelist on Discord
                  </a>
                </div>
              ) : (
                <button
                  onClick={handleMint}
                  disabled={isPending || isConfirming}
                  className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25"
                >
                  {isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Confirming in Wallet...
                    </>
                  ) : isConfirming ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Minting...
                    </>
                  ) : (
                    <>
                      <FiZap className="text-xl" />
                      Mint Access Pass
                    </>
                  )}
                </button>
              )}
              
              {isConfirmed && (
                <div className="flex items-center gap-2 text-green-400 bg-green-400/10 p-3 rounded-lg border border-green-400/20">
                  <FiCheckCircle />
                  <span>Successfully minted! Welcome to the OG Club.</span>
                </div>
              )}
              
              {mintError && (
                <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                  <FiAlertCircle />
                  <span>{mintError.message.split('\n')[0]}</span>
                </div>
              )}
            </div>
          </div>

          <div className="w-full md:w-1/3 aspect-[2/3] relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
            <div className="relative h-full w-full bg-gray-900 rounded-2xl border border-gray-700 overflow-hidden shadow-2xl">
              {/* Preview of the card */}
              <div className="absolute inset-0 flex items-center justify-center text-gray-600">
                <div className="text-center">
                  <div className="text-6xl mb-4">💎</div>
                  <div className="font-bold">OG PASS</div>
                  <div className="text-xs mt-2">HOLOGRAPHIC PREVIEW</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
          Holographic Access Passes
        </h2>
        <p className="text-gray-400">Exclusive on-chain holographic access NFTs granting platform privileges</p>
      </div>

      {/* Filters */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
            >
              <option value="all">All Tiers</option>
              <option value="Basic">Basic</option>
              <option value="Premium">Premium</option>
              <option value="VIP">VIP</option>
              <option value="Elite">Elite</option>
              <option value="Legendary">Legendary</option>
            </select>
          </div>

          <div className="text-sm text-gray-400">
            Showing {filteredNFTs.length} access passes
          </div>
        </div>
      </div>

      {/* Access Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredNFTs.map((nft) => (
          <div
            key={nft.id}
            onClick={() => setSelectedNFT(nft)}
            className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 overflow-hidden cursor-pointer hover:border-gray-700 transition-all duration-300 hover:scale-105"
            style={{
              boxShadow: `0 0 30px ${accessConfig[nft.tier].glowColor}`,
              background: `linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)`
            }}
          >
            {/* Holographic Card Preview */}
            <div className="aspect-[2/3] bg-gray-800 flex items-center justify-center relative overflow-hidden group">
              <div
                className="w-full h-full transform group-hover:scale-110 transition-transform duration-500"
                dangerouslySetInnerHTML={{
                  __html: generateHolographicAccessCard(nft)
                }}
              />
            </div>

            {/* Card Info */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-white">{nft.tier} Access</h3>
                <div className="flex items-center gap-1">
                  <FiShield className="text-cyan-400" />
                  <span className="text-sm text-gray-400">{nft.accessLevel}/100</span>
                </div>
              </div>

              <p className="text-sm text-gray-400 mb-3">Holder: {nft.holderName}</p>

              <div className="flex items-center justify-between text-sm mb-3">
                <div className="flex items-center gap-2">
                  {nft.isActive ? (
                    <FiUnlock className="text-green-400" />
                  ) : (
                    <FiLock className="text-red-400" />
                  )}
                  <span className={nft.isActive ? 'text-green-400' : 'text-red-400'}>
                    {nft.isActive ? 'Active' : 'Expired'}
                  </span>
                </div>
                <div className="text-gray-400">
                  Expires: {new Date(nft.expiryDate).toLocaleDateString()}
                </div>
              </div>

              <div className="space-y-1">
                {nft.features.slice(0, 2).map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getTierColor(nft.tier) }}></div>
                    {feature}
                  </div>
                ))}
                {nft.features.length > 2 && (
                  <div className="text-xs text-gray-400">
                    +{nft.features.length - 2} more features
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Access Card Detail Modal */}
      {selectedNFT && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">{selectedNFT.tier} Access Pass</h3>
                <button
                  onClick={() => setSelectedNFT(null)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Holographic SVG Card Display */}
                <div className="flex justify-center">
                  <div
                    className="w-80 h-auto rounded-lg overflow-hidden"
                    style={{
                      boxShadow: `0 0 40px ${accessConfig[selectedNFT.tier].glowColor}`,
                      background: 'linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.8) 100%)'
                    }}
                    dangerouslySetInnerHTML={{
                      __html: generateHolographicAccessCard(selectedNFT)
                    }}
                  />
                </div>

                {/* Access Details */}
                <div className="space-y-4">
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <FiShield className="text-cyan-400" />
                      Access Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Tier:</span>
                        <span style={{ color: getTierColor(selectedNFT.tier) }} className="font-semibold">
                          {selectedNFT.tier} {getTierIcon(selectedNFT.tier)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Access Level:</span>
                        <span className="text-cyan-400 font-semibold">{selectedNFT.accessLevel}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Status:</span>
                        <span className={selectedNFT.isActive ? 'text-green-400' : 'text-red-400'}>
                          {selectedNFT.isActive ? 'Active' : 'Expired'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Hologram ID:</span>
                        <span className="text-purple-400 font-mono text-xs">{selectedNFT.hologramId}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <FiKey className="text-yellow-400" />
                      Access Features ({selectedNFT.features.length})
                    </h4>
                    <div className="space-y-2">
                      {selectedNFT.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3 text-sm">
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: getTierColor(selectedNFT.tier) }}
                          ></div>
                          <span className="text-gray-300">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-3">Holder Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Name:</span>
                        <span className="text-white">{selectedNFT.holderName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Address:</span>
                        <span className="text-gray-300 font-mono text-xs">{selectedNFT.holderAddress.slice(0, 10)}...{selectedNFT.holderAddress.slice(-8)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Issued:</span>
                        <span className="text-white">{new Date(selectedNFT.issuedDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Expires:</span>
                        <span className={selectedNFT.isActive ? 'text-white' : 'text-red-400'}>
                          {new Date(selectedNFT.expiryDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button className="flex-1 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2">
                      <FiZap />
                      Renew Access
                    </button>
                    <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2">
                      <FiStar />
                      Transfer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Holographic Effect Legend */}
      <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FiShield className="text-cyan-400" />
          Holographic Security Features
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-white mb-3">Visual Effects</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-400 to-purple-400"></div>
                Rainbow holographic gradients
              </li>
              <li className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-white/50"></div>
                Metallic shimmer effects
              </li>
              <li className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-400/50"></div>
                Interference patterns
              </li>
              <li className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-pink-400/50"></div>
                Dynamic glow animations
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3">Security Elements</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center gap-2">
                <FiKey className="text-green-400" />
                Unique hologram IDs
              </li>
              <li className="flex items-center gap-2">
                <FiShield className="text-blue-400" />
                Encrypted security codes
              </li>
              <li className="flex items-center gap-2">
                <FiStar className="text-purple-400" />
                Access level verification
              </li>
              <li className="flex items-center gap-2">
                <FiLock className="text-red-400" />
                Expiration tracking
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-400 text-center">
          All holographic effects are computer-generated on-chain with zero external dependencies.
          Each access pass contains unique security identifiers for platform verification.
        </div>
      </div>

      <style jsx>{`
        @keyframes hologram-shimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}