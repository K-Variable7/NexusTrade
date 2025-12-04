'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi';
import { CONTRACT_CONFIGS } from '../../lib/contracts';
import { FiMessageSquare, FiThumbsUp, FiClock, FiCheckCircle } from 'react-icons/fi';

interface Proposal {
  id: string;
  proposer: string;
  title: string;
  description: string;
  voteCount: number;
  startTime: number;
  endTime: number;
  executed: boolean;
}

export default function Governance({ onClose }: { onClose: () => void }) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Get contract config
  const contractConfig = chainId === 111545111 ? CONTRACT_CONFIGS.tenderly.Governance : null;

  // Read proposals (mock for now, real implementation would fetch count then loop)
  const { data: proposalCount } = useReadContract({
    ...contractConfig,
    functionName: 'proposalCount',
    query: { enabled: !!contractConfig },
  });

  // Write functions
  const { writeContract: createProposal, data: createHash, isPending: isCreating } = useWriteContract();
  const { writeContract: vote, data: voteHash, isPending: isVoting } = useWriteContract();

  const { isLoading: isConfirmingCreate, isSuccess: isCreated } = useWaitForTransactionReceipt({ hash: createHash });
  const { isLoading: isConfirmingVote, isSuccess: isVoted } = useWaitForTransactionReceipt({ hash: voteHash });

  useEffect(() => {
    if (isCreated) {
      alert('Proposal created successfully!');
      setShowCreate(false);
      setTitle('');
      setDescription('');
    }
  }, [isCreated]);

  useEffect(() => {
    if (isVoted) {
      alert('Vote submitted successfully!');
    }
  }, [isVoted]);

  const handleCreate = async () => {
    if (!contractConfig) return;
    try {
      createProposal({
        ...contractConfig,
        functionName: 'createProposal',
        args: [title, description],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleVote = async (id: string) => {
    if (!contractConfig) return;
    try {
      vote({
        ...contractConfig,
        functionName: 'vote',
        args: [BigInt(id)],
      });
    } catch (error) {
      console.error(error);
    }
  };

  // Mock proposals for display if none exist
  useEffect(() => {
    if (!proposalCount || Number(proposalCount) === 0) {
      setProposals([
        {
          id: '0',
          proposer: '0x123...abc',
          title: 'Increase Staking Rewards',
          description: 'Proposal to increase the APY for the main staking pool to 15% to attract more liquidity.',
          voteCount: 42,
          startTime: Date.now() / 1000,
          endTime: Date.now() / 1000 + 86400 * 3,
          executed: false
        }
      ]);
    }
  }, [proposalCount]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 w-full max-w-4xl h-[80vh] rounded-2xl border border-white/10 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-800/50">
          <div className="flex items-center gap-3">
            <FiMessageSquare className="text-2xl text-cyan-400" />
            <h2 className="text-2xl font-bold text-white">Community Governance</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-white">Active Proposals</h3>
            <button
              onClick={() => setShowCreate(true)}
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Create Proposal
            </button>
          </div>

          {showCreate && (
            <div className="mb-8 bg-slate-800 p-6 rounded-xl border border-cyan-500/30">
              <h4 className="text-lg font-medium text-white mb-4">New Proposal</h4>
              <input
                type="text"
                placeholder="Proposal Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-900 border border-gray-700 rounded-lg px-4 py-2 text-white mb-4 focus:border-cyan-500 outline-none"
              />
              <textarea
                placeholder="Describe your proposal..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-900 border border-gray-700 rounded-lg px-4 py-2 text-white mb-4 h-32 focus:border-cyan-500 outline-none"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={isCreating || isConfirmingCreate || !title || !description}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded-lg disabled:opacity-50"
                >
                  {isCreating ? 'Confirming...' : isConfirmingCreate ? 'Creating...' : 'Submit Proposal'}
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {proposals.map((proposal) => (
              <div key={proposal.id} className="bg-slate-800/50 p-6 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-medium text-white mb-1">{proposal.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <FiClock /> Ends in {Math.ceil((proposal.endTime - Date.now() / 1000) / 86400)} days
                      </span>
                      <span>Proposer: {proposal.proposer.slice(0, 6)}...{proposal.proposer.slice(-4)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-900 px-3 py-1 rounded-lg border border-white/10">
                    <FiThumbsUp className="text-cyan-400" />
                    <span className="text-white font-bold">{proposal.voteCount}</span>
                  </div>
                </div>
                <p className="text-gray-300 mb-6">{proposal.description}</p>
                <button
                  onClick={() => handleVote(proposal.id)}
                  disabled={isVoting || isConfirmingVote}
                  className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isVoting ? 'Confirming...' : isConfirmingVote ? 'Voting...' : 'Vote For Proposal'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
