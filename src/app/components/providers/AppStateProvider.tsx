'use client';

import { createContext, useState, useContext, type ReactNode, useEffect, useCallback } from 'react';
import type { Proposal, VoteType } from '@/lib/types';
import { useWeb3 } from '@/app/hooks/useWeb3';
import { formatProposal } from '@/lib/utils';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, MONAD_RPC_URL } from '@/lib/constants';
import { contractAbi } from '@/lib/contract';

interface AppStateContextType {
  proposals: Proposal[];
  isLoading: boolean;
  addProposal: (proposal: Proposal) => void;
  updateVote: (proposalId: string, voteType: VoteType) => void;
  fetchProposals: () => Promise<void>;
}

const AppStateContext = createContext<AppStateContextType | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { provider } = useWeb3();

  const fetchProposals = useCallback(async () => {
    // If there is no contract address, do not attempt to fetch proposals.
    if (!CONTRACT_ADDRESS || !CONTRACT_ADDRESS.startsWith('0x')) {
      console.warn("Contract address is not set. Skipping proposal fetch.");
      setProposals([]);
      setIsLoading(false);
      return;
    }

    // Use a read-only JsonRpcProvider to avoid ENS errors.
    const currentProvider = provider || new ethers.JsonRpcProvider(MONAD_RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi, currentProvider);

    setIsLoading(true);
    try {
      const proposalCount = await contract.getProposalCount();
      const proposalsData = [];
      for (let i = 0; i < proposalCount; i++) {
        const p = await contract.getProposal(i);
        proposalsData.push(formatProposal(p));
      }
      setProposals(proposalsData.reverse()); // Show newest first
    } catch (error) {
      console.error("Failed to fetch proposals:", error);
      // Set proposals to empty array on error to avoid crash
      setProposals([]);
    } finally {
      setIsLoading(false);
    }
  }, [provider]);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  const addProposal = (proposal: Proposal) => {
    setProposals(prevProposals => [proposal, ...prevProposals]);
  };

  const updateVote = (proposalId: string, voteType: 'upvote' | 'downvote') => {
    setProposals(prevProposals =>
      prevProposals.map(p => {
        if (p.id === proposalId) {
          return {
            ...p,
            upvotes: voteType === 'upvote' ? p.upvotes + 1 : p.upvotes,
            downvotes: voteType === 'downvote' ? p.downvotes + 1 : p.downvotes,
          };
        }
        return p;
      })
    );
  };

  return (
    <AppStateContext.Provider value={{ proposals, isLoading, addProposal, updateVote, fetchProposals }}>
      {children}
    </AppStateContext.Provider>
  );
}

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};
