'use client';

import { useWeb3 } from '@/app/hooks/useWeb3';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, AlertTriangle } from 'lucide-react';
import { MONAD_CHAIN_ID } from '@/lib/constants';

interface ConnectWalletProps {
  isMobile?: boolean;
}

export default function ConnectWallet({ isMobile = false }: ConnectWalletProps) {
  const { connectWallet, address, chainId } = useWeb3();

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const NetworkStatus = () => (
    <>
        {chainId === MONAD_CHAIN_ID ? (
            <Badge variant="secondary" className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                Monad Testnet
            </Badge>
        ) : (
        <Badge variant="destructive" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Wrong Network
        </Badge>
        )}
    </>
  )

  if (address) {
    if (isMobile) {
        return (
             <div className="flex flex-col items-start gap-3 px-4">
                <NetworkStatus />
                <Badge variant="outline" className="w-full justify-center py-2 text-sm">{truncateAddress(address)}</Badge>
            </div>
        )
    }
    return (
      <div className="flex items-center gap-2">
        <NetworkStatus />
        <Badge variant="outline">{truncateAddress(address)}</Badge>
      </div>
    );
  }

  return (
    <Button onClick={connectWallet} className={isMobile ? 'w-full' : ''}>
      <Wallet className="mr-2 h-4 w-4" />
      Connect Wallet
    </Button>
  );
}