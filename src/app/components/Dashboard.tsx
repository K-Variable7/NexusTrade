'use client';

import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi';
import { metaMask } from 'wagmi/connectors';
import AIInsights from './AIInsights';
import BlockchainAnalytics from './BlockchainAnalytics';
import TradingPools from './TradingPools';
import Challenges from './Challenges';
import StrategyNFTs from './StrategyNFTs';
import AccessNFTs from './AccessNFTs';
import StakingPools from './StakingPools';
import NexusSwap from './NexusSwap';
import Governance from './Governance';
import AboutNexus from './AboutNexus';
import Documentation from './Documentation';
import SocialLinks from './SocialLinks';
import { FiTrendingUp, FiTarget, FiZap, FiCreditCard, FiMessageSquare, FiBarChart, FiShield } from 'react-icons/fi';
import { useState, useEffect } from 'react';

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({
    address: address,
  });
  const [currentLanguage, setCurrentLanguage] = useState(0);
  const [activeTab, setActiveTab] = useState<'pools' | 'challenges' | 'nfts' | 'access' | 'analytics' | 'staking' | 'swap'>('pools');
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [showGovernance, setShowGovernance] = useState(false);
  const [showDocumentation, setShowDocumentation] = useState(false);

  const languages = [
    "Decentralized Trading Nexus",
    "Nexus de Comercio Descentralizado",
    "Nexus Commercial Décentralisé",
    "Nexus di Trading Decentralizzato",
    "Dezentrales Handelsnetzwerk",
    "Nexus de Comércio Descentralizado",
    "Децентрализованная торговая сеть",
    "去中心化交易网络",
    "分散型取引ネットワーク",
    "분산형 거래 네트워크"
  ];

  useEffect(() => {
    const languageInterval = setInterval(() => {
      setCurrentLanguage(prev => (prev + 1) % languages.length);
    }, 2000); // Change every 2 seconds

    return () => clearInterval(languageInterval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8 relative overflow-hidden">
      {/* Stars background */}
      <div className="absolute inset-0">
        {[...Array(200)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full animate-star-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 2 + 1}s`,
            }}
          />
        ))}
      </div>

      {/* Nebula effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Wallet connection in upper right */}
      <div className="absolute top-8 right-8 z-20">
        {isConnected ? (
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 shadow-2xl flex items-center space-x-3 hover:bg-white/15 transition-all duration-300">
            <FiCreditCard className="text-cyan-400 text-xl" />
            <div className="text-sm">
              <div className="text-white font-medium">
                {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Unknown'}
              </div>
              <div className="text-cyan-400 text-xs">
                {balance ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : 'Loading...'}
              </div>
            </div>
            <button
              onClick={() => disconnect()}
              className="text-red-400 hover:text-red-300 text-sm ml-2"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => connect({ connector: metaMask() })}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-3 rounded-xl hover:from-cyan-500 hover:to-blue-500 transition-all duration-300 shadow-lg text-sm font-medium border border-cyan-400/50"
          >
            Connect Wallet
          </button>
        )}
      </div>

      {/* AI Insights Widget - Upper Left */}
      <div className="absolute top-8 left-8 z-20">
        <button
          onClick={() => setShowAIInsights(true)}
          className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20 shadow-2xl hover:bg-white/15 transition-all duration-300 group"
          title="AI Trading Insights"
        >
          <FiMessageSquare className="text-cyan-400 text-xl group-hover:text-cyan-300 transition-colors duration-300" />
        </button>
      </div>

      <div className="relative z-10">
        <header className="text-center mb-12 pt-16">
          <h1 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tight" style={{fontFamily: 'var(--font-orbitron)'}}>
            NexusTrade
          </h1>
          <p className="text-xl text-gray-300 mb-8 font-light transition-all duration-500 ease-in-out">
            {languages[currentLanguage]}
          </p>
          <div className="flex justify-center items-center space-x-8 text-sm text-gray-400 mb-8">
            <span>ETH: $3,245.67</span>
            <span className="text-green-400">+2.3%</span>
            <span>•</span>
            <span>Network: Ethereum</span>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/5 backdrop-blur-md p-2 rounded-xl border border-white/10 shadow-lg">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('pools')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                  activeTab === 'pools'
                    ? 'bg-blue-600/80 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <FiTrendingUp className="text-lg" />
                <span>Trading Pools</span>
              </button>
              <button
                onClick={() => setActiveTab('challenges')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                  activeTab === 'challenges'
                    ? 'bg-purple-600/80 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <FiTarget className="text-lg" />
                <span>Challenges</span>
              </button>
              <button
                onClick={() => setActiveTab('nfts')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                  activeTab === 'nfts'
                    ? 'bg-green-600/80 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <FiZap className="text-lg" />
                <span>Strategy NFTs</span>
              </button>
              <button
                onClick={() => setActiveTab('access')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                  activeTab === 'access'
                    ? 'bg-cyan-600/80 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <FiShield className="text-lg" />
                <span>Access NFTs</span>
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                  activeTab === 'analytics'
                    ? 'bg-yellow-600/80 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <FiBarChart className="text-lg" />
                <span>Analytics</span>
              </button>
              <button
                onClick={() => setActiveTab('staking')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                  activeTab === 'staking'
                    ? 'bg-red-600/80 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <FiCreditCard className="text-lg" />
                <span>Staking</span>
              </button>
              <button
                onClick={() => setActiveTab('swap')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                  activeTab === 'swap'
                    ? 'bg-green-600/80 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <FiZap className="text-lg" />
                <span>Swap</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="transition-all duration-500">
          {activeTab === 'pools' && <TradingPools />}
          {activeTab === 'challenges' && <Challenges />}
          {activeTab === 'nfts' && <StrategyNFTs />}
          {activeTab === 'access' && <AccessNFTs />}
          {activeTab === 'analytics' && (
            <div className="w-full">
              <BlockchainAnalytics />
            </div>
          )}
          {activeTab === 'staking' && <StakingPools />}
          {activeTab === 'swap' && <NexusSwap />}
        </main>
      </div>

      {/* AI Insights Modal */}
      {showAIInsights && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 p-6 rounded-xl border border-white/20 w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <FiMessageSquare className="text-cyan-400 text-2xl mr-3" />
                <h3 className="text-xl font-bold text-white">AI Trading Insights</h3>
              </div>
              <button
                onClick={() => setShowAIInsights(false)}
                className="text-gray-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[75vh] overflow-y-auto">
              <AIInsights />
            </div>
          </div>
        </div>
      )}
      {/* About Nexus Section */}
      <AboutNexus />

      {/* Footer Links */}
      <div className="relative z-10 mt-12 text-center border-t border-white/10 pt-8 pb-4">
        <div className="flex justify-center mb-6">
          <SocialLinks />
        </div>
        <div className="flex justify-center space-x-8 text-sm text-gray-400">
          <a href="#about-nexus" className="hover:text-cyan-400 transition-colors">About Nexus</a>
          <button 
            onClick={() => setShowDocumentation(true)}
            className="hover:text-cyan-400 transition-colors"
          >
            Documentation
          </button>
          <button 
            onClick={() => setShowGovernance(true)}
            className="hover:text-cyan-400 transition-colors flex items-center gap-2"
          >
            <FiMessageSquare /> Community Forum / DAO Proposals
          </button>
          <a href="#" className="hover:text-cyan-400 transition-colors">Terms of Service</a>
        </div>
        <div className="mt-4 text-xs text-gray-600">
          © 2025 NexusTrade. All rights reserved.
        </div>
      </div>

      {/* Governance Modal */}
      {showGovernance && <Governance onClose={() => setShowGovernance(false)} />}
      
      {/* Documentation Modal */}
      {showDocumentation && <Documentation onClose={() => setShowDocumentation(false)} />}
    </div>
  );
}