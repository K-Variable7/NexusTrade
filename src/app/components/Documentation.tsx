import { useState } from 'react';
import { FiX, FiBook, FiCode, FiLayers, FiCpu, FiShield, FiActivity, FiTarget, FiWifi } from 'react-icons/fi';

interface DocumentationProps {
  onClose: () => void;
}

type SectionKey = 'intro' | 'wallet' | 'testnet' | 'pools' | 'challenges' | 'token' | 'contracts' | 'audits';

export default function Documentation({ onClose }: DocumentationProps) {
  const [activeSection, setActiveSection] = useState<SectionKey>('intro');

  const renderContent = () => {
    switch (activeSection) {
      case 'intro':
        return (
          <div className="space-y-8">
            <section>
              <h3 className="text-2xl font-bold text-white mb-4">Introduction to Nexus Trade</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                Nexus Trade is a decentralized trading ecosystem designed to gamify the DeFi experience while providing enterprise-grade analytics. 
                Built on the Tenderly Virtual Testnet, it allows users to compete in trading challenges, join community pools, and earn rewards through our adaptive tokenomics system.
              </p>
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 flex gap-4 items-start">
                <FiCpu className="text-purple-400 text-xl mt-1 flex-shrink-0" />
                <div>
                  <h4 className="text-white font-medium mb-1">Powered by AI</h4>
                  <p className="text-sm text-gray-400">
                    Our platform integrates real-time AI insights to help traders make informed decisions based on on-chain data and market sentiment.
                  </p>
                </div>
              </div>
            </section>
            <section>
              <h3 className="text-xl font-bold text-white mb-4">Key Features</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center gap-2"><FiActivity className="text-cyan-400" /> Real-time Trading Analytics</li>
                <li className="flex items-center gap-2"><FiTarget className="text-green-400" /> Gamified Trading Challenges</li>
                <li className="flex items-center gap-2"><FiLayers className="text-purple-400" /> NFT-gated Access & Rewards</li>
                <li className="flex items-center gap-2"><FiShield className="text-yellow-400" /> DAO Governance</li>
              </ul>
            </section>
          </div>
        );
      case 'wallet':
        return (
          <div className="space-y-8">
            <section>
              <h3 className="text-2xl font-bold text-white mb-4">Wallet Setup</h3>
              <p className="text-gray-300 leading-relaxed mb-6">
                To interact with Nexus Trade, you need a Web3 wallet. We recommend MetaMask or Rabby Wallet.
              </p>
              <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 space-y-4">
                <h4 className="text-lg font-semibold text-white">Step-by-Step Guide</h4>
                <ol className="list-decimal list-inside space-y-3 text-gray-300">
                  <li>Download and install the <span className="text-cyan-400">MetaMask</span> browser extension.</li>
                  <li>Create a new wallet or import an existing one using your recovery phrase.</li>
                  <li>Ensure you keep your recovery phrase secure and never share it.</li>
                  <li>Refresh this page and click "Connect Wallet" in the top right corner.</li>
                </ol>
              </div>
            </section>
          </div>
        );
      case 'testnet':
        return (
          <div className="space-y-8">
            <section>
              <h3 className="text-2xl font-bold text-white mb-4">Connecting to Testnet</h3>
              <p className="text-gray-300 leading-relaxed mb-6">
                Nexus Trade currently operates on the Tenderly Virtual Testnet (Sepolia Fork). You need to add this network to your wallet to transact.
              </p>
              <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <div className="flex items-center gap-2 mb-4">
                  <FiWifi className="text-green-400" />
                  <h4 className="text-lg font-semibold text-white">Network Details</h4>
                </div>
                <div className="grid gap-4 text-sm">
                  <div className="flex justify-between border-b border-gray-700 pb-2">
                    <span className="text-gray-400">Network Name</span>
                    <span className="text-white font-mono">Tenderly Virtual Testnet</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-700 pb-2">
                    <span className="text-gray-400">RPC URL</span>
                    <span className="text-white font-mono text-right break-all pl-4">https://virtual.sepolia.eu.rpc.tenderly.co/5d2dda35-3231-4210-a47c-16f34e244e33</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-700 pb-2">
                    <span className="text-gray-400">Chain ID</span>
                    <span className="text-white font-mono">111545111</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Currency Symbol</span>
                    <span className="text-white font-mono">ETH</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        );
      case 'pools':
        return (
          <div className="space-y-8">
            <section>
              <h3 className="text-2xl font-bold text-white mb-4">Trading Pools</h3>
              <p className="text-gray-300 leading-relaxed mb-6">
                Trading Pools allow users to pool capital together to execute collective trading strategies. Profits are distributed proportionally to your share of the pool.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-800/50 p-5 rounded-xl border border-gray-700">
                  <h4 className="text-cyan-400 font-semibold mb-2">Public Pools</h4>
                  <p className="text-sm text-gray-400">Open to anyone. Managed by community-voted strategies or automated AI agents.</p>
                </div>
                <div className="bg-gray-800/50 p-5 rounded-xl border border-gray-700">
                  <h4 className="text-purple-400 font-semibold mb-2">Private Pools</h4>
                  <p className="text-sm text-gray-400">Invite-only pools for friends or DAOs. Custom fee structures and access controls.</p>
                </div>
              </div>
            </section>
          </div>
        );
      case 'challenges':
        return (
          <div className="space-y-8">
            <section>
              <h3 className="text-2xl font-bold text-white mb-4">Trading Challenges</h3>
              <p className="text-gray-300 leading-relaxed mb-6">
                Prove your skills in weekly trading competitions. Participants start with the same virtual balance and compete for the highest ROI.
              </p>
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700">
                <h4 className="text-lg font-semibold text-white mb-4">Rewards Structure</h4>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-center gap-2">🥇 <span className="text-yellow-400 font-bold">1st Place:</span> 50% of Prize Pool + Gold NFT</li>
                  <li className="flex items-center gap-2">🥈 <span className="text-gray-300 font-bold">2nd Place:</span> 30% of Prize Pool + Silver NFT</li>
                  <li className="flex items-center gap-2">🥉 <span className="text-orange-400 font-bold">3rd Place:</span> 20% of Prize Pool + Bronze NFT</li>
                </ul>
              </div>
            </section>
          </div>
        );
      case 'token':
        return (
          <div className="space-y-8">
            <section>
              <h3 className="text-2xl font-bold text-white mb-4">Nexus Token (NXT)</h3>
              <p className="text-gray-300 leading-relaxed mb-6">
                NXT is the utility and governance token of the ecosystem. It features an adaptive fee mechanism that adjusts based on network volume.
              </p>
              <div className="grid gap-4">
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                  <h4 className="text-white font-semibold mb-2">Adaptive Fees</h4>
                  <p className="text-sm text-gray-400">
                    Transaction fees range from 1% to 8% depending on the 24h trading volume. Higher volume leads to lower fees, incentivizing activity.
                  </p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                  <h4 className="text-white font-semibold mb-2">Staking</h4>
                  <p className="text-sm text-gray-400">
                    Stake NXT to earn a share of protocol revenue. Holders of the OG Access Pass receive a 2x multiplier on staking rewards.
                  </p>
                </div>
              </div>
            </section>
          </div>
        );
      case 'contracts':
        return (
          <div className="space-y-8">
            <section>
              <h3 className="text-2xl font-bold text-white mb-4">Smart Contracts</h3>
              <p className="text-gray-300 leading-relaxed mb-6">
                Verified contract addresses on the Tenderly Virtual Testnet.
              </p>
              <div className="space-y-3">
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-800 flex justify-between items-center">
                  <span className="text-gray-400">AccessNFT</span>
                  <span className="text-cyan-400 font-mono text-sm">0x99A6739f948aBA2e40115670E5175509c15c5B5D</span>
                </div>
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-800 flex justify-between items-center">
                  <span className="text-gray-400">Staking</span>
                  <span className="text-cyan-400 font-mono text-sm">0x441ca4c70535abBBB8f90D40D959A424be57c61e</span>
                </div>
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-800 flex justify-between items-center">
                  <span className="text-gray-400">NexusToken</span>
                  <span className="text-cyan-400 font-mono text-sm">0x6Bb6c49ff9D10439262F17116585CF047DC5d88a</span>
                </div>
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-800 flex justify-between items-center">
                  <span className="text-gray-400">Governance</span>
                  <span className="text-cyan-400 font-mono text-sm">Deployed</span>
                </div>
              </div>
            </section>
          </div>
        );
      case 'audits':
        return (
          <div className="space-y-8">
            <section>
              <h3 className="text-2xl font-bold text-white mb-4">Security & Audits</h3>
              <p className="text-gray-300 leading-relaxed mb-6">
                Security is our top priority. Our contracts undergo rigorous internal testing and are scheduled for external audits.
              </p>
              <div className="bg-yellow-500/10 border border-yellow-500/30 p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <FiShield className="text-yellow-400 text-xl" />
                  <h4 className="text-white font-semibold">Audit Status</h4>
                </div>
                <p className="text-gray-300 text-sm">
                  Internal audits completed. Third-party audit pending for Phase 3 Mainnet launch.
                  Always trade responsibly and do your own research.
                </p>
              </div>
            </section>
          </div>
        );
      default:
        return null;
    }
  };

  const NavItem = ({ id, label }: { id: SectionKey, label: string }) => (
    <div 
      onClick={() => setActiveSection(id)}
      className={`p-2 rounded-lg text-sm cursor-pointer transition-colors ${
        activeSection === id 
          ? 'bg-cyan-500/10 text-cyan-400 font-medium' 
          : 'text-gray-400 hover:text-white hover:bg-gray-800'
      }`}
    >
      {label}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl shadow-cyan-500/10">
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <FiBook className="text-cyan-400 text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Nexus Documentation</h2>
              <p className="text-sm text-gray-400">Technical specifications and guides</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="grid md:grid-cols-[240px_1fr] gap-8">
            {/* Sidebar Navigation */}
            <div className="space-y-1 hidden md:block">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Getting Started</div>
              <NavItem id="intro" label="Introduction" />
              <NavItem id="wallet" label="Wallet Setup" />
              <NavItem id="testnet" label="Connecting to Testnet" />
              
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 mt-6">Core Concepts</div>
              <NavItem id="pools" label="Trading Pools" />
              <NavItem id="challenges" label="Challenges" />
              <NavItem id="token" label="Nexus Token" />

              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 mt-6">Developers</div>
              <NavItem id="contracts" label="Smart Contracts" />
              <NavItem id="audits" label="Audits" />
            </div>

            {/* Main Content Area */}
            <div>
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
