'use client';

import Header from '@/app/components/Header';
import ProposalList from '@/app/components/ProposalList';
import { useAppState } from '@/app/components/providers/AppStateProvider';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { useWeb3 } from '../hooks/useWeb3';
import ConnectWalletMessage from '../components/ConnectWalletMessage';

export default function MainPage() {
  const { proposals, updateVote, isLoading } = useAppState();
  const { isConnected } = useWeb3();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Community Proposals
            </h1>
            {!isLoading && isConnected && (
              <Badge variant="default" className="text-sm">
                {proposals.length}
              </Badge>
            )}
          </div>
           <Button asChild className="w-full sm:w-auto">
                <Link href="/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Proposal
                </Link>
            </Button>
        </div>
        {isConnected ? (
          <ProposalList proposals={proposals} onVote={updateVote} isLoading={isLoading} />
        ) : (
            <ConnectWalletMessage />
        )}
      </main>
      <footer className="py-6 text-center text-muted-foreground">
        Built on Monad Testnet
      </footer>
    </div>
  );
}
