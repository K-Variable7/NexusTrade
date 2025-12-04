import { FiCheckCircle, FiTarget, FiCpu, FiLayers, FiUsers, FiTrendingUp } from 'react-icons/fi';

export default function AboutNexus() {
  return (
    <div id="about-nexus" className="relative z-10 mt-20 border-t border-white/10 pt-16 pb-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-4">
            About Nexus Trade
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            A next-generation decentralized trading ecosystem governed entirely by its community. 
            Nexus Trade combines advanced AI analytics, gamified trading challenges, and a unique 
            NFT-based access system to revolutionize DeFi engagement.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          {/* Live Implementations */}
          <div className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <FiCpu className="text-cyan-400" />
              Live Ecosystem Features
            </h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="mt-1">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <FiLayers />
                  </div>
                </div>
                <div>
                  <h4 className="text-white font-medium">Trading Pools & Challenges</h4>
                  <p className="text-sm text-gray-400 mt-1">
                    Participate in community-driven pools with profit sharing or compete in weekly trading challenges to earn rewards.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="mt-1">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                    <FiUsers />
                  </div>
                </div>
                <div>
                  <h4 className="text-white font-medium">DAO Governance</h4>
                  <p className="text-sm text-gray-400 mt-1">
                    Full on-chain governance. Holders propose and vote on protocol parameters, fee structures, and treasury allocations.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="mt-1">
                  <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400">
                    <FiTrendingUp />
                  </div>
                </div>
                <div>
                  <h4 className="text-white font-medium">OG Access Pass & Staking</h4>
                  <p className="text-sm text-gray-400 mt-1">
                    Exclusive NFT passes (0.1 ETH) providing a 2x Staking Boost (20% APY) and revenue share opportunities.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Roadmap */}
          <div className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <FiTarget className="text-purple-400" />
              Development Roadmap
            </h3>
            <div className="relative border-l-2 border-gray-800 ml-3 space-y-8 pl-8">
              <div className="relative">
                <div className="absolute -left-[41px] w-6 h-6 rounded-full bg-green-500 border-4 border-gray-900"></div>
                <h4 className="text-green-400 font-medium text-sm mb-1">PHASE 1 - COMPLETED</h4>
                <h5 className="text-white font-semibold">Core Infrastructure</h5>
                <p className="text-sm text-gray-400 mt-1">
                  Smart Contract Deployment (Tenderly), Governance Module, OG Access Pass Minting, Staking Contracts.
                </p>
              </div>

              <div className="relative">
                <div className="absolute -left-[41px] w-6 h-6 rounded-full bg-cyan-500 border-4 border-gray-900 animate-pulse"></div>
                <h4 className="text-cyan-400 font-medium text-sm mb-1">PHASE 2 - IN PROGRESS</h4>
                <h5 className="text-white font-semibold">Liquidity Generation Event</h5>
                <p className="text-sm text-gray-400 mt-1">
                  Initial Liquidity Pool Seeding (Uniswap V3), Community Building, Marketing Campaign Launch.
                </p>
              </div>

              <div className="relative">
                <div className="absolute -left-[41px] w-6 h-6 rounded-full bg-gray-700 border-4 border-gray-900"></div>
                <h4 className="text-gray-500 font-medium text-sm mb-1">PHASE 3 - UPCOMING</h4>
                <h5 className="text-white font-semibold">Expansion & Scale</h5>
                <p className="text-sm text-gray-400 mt-1">
                  Cross-chain Bridge (Arbitrum/Optimism), Mobile App Beta, Advanced AI Trading Agents.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center border-t border-gray-800 pt-8">
          <p className="text-gray-500 text-sm">
            Contract Addresses (Tenderly Testnet):<br/>
            <span className="font-mono text-xs text-gray-600">
              AccessNFT: 0x99A6...B5D | Staking: 0x441c...61e | Governance: [Deployed]
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
