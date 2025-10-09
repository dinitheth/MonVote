'use client';

import {
  createContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { ethers, type BrowserProvider, type JsonRpcSigner, type Contract, Network } from 'ethers';
import { MONAD_CHAIN_ID, MONAD_RPC_URL, CONTRACT_ADDRESS } from '@/lib/constants';
import { contractAbi } from '@/lib/contract';
import { useToast } from '@/hooks/use-toast';

interface Web3ContextType {
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  contract: Contract | null;
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

export const Web3Context = createContext<Web3ContextType | null>(null);

const monadNetwork = new Network("monad-testnet", MONAD_CHAIN_ID);

export function Web3Provider({ children }: { children: ReactNode }) {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const { toast } = useToast();

  const disconnectWallet = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setContract(null);
    setAddress(null);
    setChainId(null);
  }, []);

  const setupProvider = async (browserProvider: BrowserProvider) => {
    setProvider(browserProvider);
    const network = await browserProvider.getNetwork();
    setChainId(Number(network.chainId));
    const signer = await browserProvider.getSigner();
    setSigner(signer);
    setAddress(await signer.getAddress());
    
    // Make sure we have a contract address before initializing
    if (CONTRACT_ADDRESS && CONTRACT_ADDRESS.startsWith('0x')) {
       setContract(new ethers.Contract(CONTRACT_ADDRESS, contractAbi, signer));
    } else {
       setContract(null);
    }
  }

  const handleAccountsChanged = useCallback(async (accounts: string[]) => {
    if (accounts.length > 0) {
      if (window.ethereum) {
        const browserProvider = new ethers.BrowserProvider(window.ethereum, 'any');
        const network = await browserProvider.getNetwork();
        if (Number(network.chainId) !== MONAD_CHAIN_ID) {
          await switchNetwork();
        }
        await setupProvider(new ethers.BrowserProvider(window.ethereum, monadNetwork));
      }
    } else {
      disconnectWallet();
    }
  }, [disconnectWallet]);

  const switchNetwork = async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${MONAD_CHAIN_ID.toString(16)}` }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${MONAD_CHAIN_ID.toString(16)}`,
                chainName: 'Monad Testnet',
                nativeCurrency: {
                  name: 'MON',
                  symbol: 'MON',
                  decimals: 18,
                },
                rpcUrls: [MONAD_RPC_URL],
                blockExplorerUrls: ['https://testnet.monadexplorer.com'],
              },
            ],
          });
        } catch (addError) {
          console.error('Failed to add network:', addError);
          toast({
            variant: 'destructive',
            title: 'Network Error',
            description: 'Failed to add Monad Testnet to your wallet.',
          });
        }
      } else {
        console.error('Failed to switch network:', switchError);
         toast({
            variant: 'destructive',
            title: 'Network Error',
            description: 'Failed to switch to Monad Testnet.',
          });
      }
    }
  };
  
  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      toast({
        variant: 'destructive',
        title: 'MetaMask not found',
        description: 'Please install MetaMask to connect your wallet.',
      });
      return;
    }

    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum, 'any');
      const network = await browserProvider.getNetwork();

      if (Number(network.chainId) !== MONAD_CHAIN_ID) {
        await switchNetwork();
        // After switching, the page might reload or the provider might need re-initialization
        // We will rely on the chainChanged event or a manual re-setup.
        const newProvider = new ethers.BrowserProvider(window.ethereum, monadNetwork);
        await newProvider.send('eth_requestAccounts', []);
        await setupProvider(newProvider);
        return;
      }
      
      const newProviderWithNetwork = new ethers.BrowserProvider(window.ethereum, monadNetwork);
      await newProviderWithNetwork.send('eth_requestAccounts', []);
      await setupProvider(newProviderWithNetwork);

    } catch (error) {
      console.error('Failed to connect wallet:', error);
      disconnectWallet();
      toast({
        variant: 'destructive',
        title: 'Connection Failed',
        description: 'Something went wrong while connecting your wallet.',
      });
    }
  };

  const reconnectWallet = useCallback(async () => {
    if (typeof window.ethereum === 'undefined' || !localStorage.getItem('isWalletConnected')) {
      return;
    }
    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum, 'any');
      const accounts = await browserProvider.listAccounts();
      if (accounts.length > 0) {
         const newProvider = new ethers.BrowserProvider(window.ethereum, monadNetwork);
        const network = await newProvider.getNetwork();
        if (Number(network.chainId) !== MONAD_CHAIN_ID) {
          await switchNetwork();
          // After switching network, we need to re-initialize the provider
          const switchedProvider = new ethers.BrowserProvider(window.ethereum, monadNetwork);
          await setupProvider(switchedProvider);
        } else {
          await setupProvider(newProvider);
        }
      } else {
        localStorage.removeItem('isWalletConnected');
      }
    } catch (error) {
        console.error("Failed to reconnect wallet:", error);
        localStorage.removeItem('isWalletConnected');
    }
  }, []);

  useEffect(() => {
    reconnectWallet();
  }, [reconnectWallet]);


  useEffect(() => {
    if (window.ethereum) {
      const handleChainChanged = () => window.location.reload();
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        if(window.ethereum.removeListener) {
            window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, [handleAccountsChanged]);
  
  useEffect(() => {
    if (address) {
      localStorage.setItem('isWalletConnected', 'true');
    } else {
      localStorage.removeItem('isWalletConnected');
    }
  }, [address]);

  return (
    <Web3Context.Provider
      value={{
        provider,
        signer,
        contract,
        address,
        chainId,
        isConnected: !!address,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}
