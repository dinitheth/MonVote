'use client';

import { Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWeb3 } from '../hooks/useWeb3';

export default function ConnectWalletMessage() {
    const { connectWallet } = useWeb3();

    return (
        <div className="text-center py-16 border-2 border-dashed rounded-lg flex flex-col items-center gap-4">
            <Wallet className="h-10 w-10 text-muted-foreground" />
            <h2 className="text-xl font-medium text-muted-foreground">Connect your wallet</h2>
            <p className="text-muted-foreground max-w-sm">
                Please connect your wallet to view community proposals, vote on them, or create your own.
            </p>
            <Button onClick={connectWallet} className="mt-2">
                Connect Wallet
            </Button>
        </div>
    );
}
