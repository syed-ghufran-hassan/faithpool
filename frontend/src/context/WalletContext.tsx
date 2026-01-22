import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  balance: number;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | null>(null);

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);

  const connect = useCallback(async () => {
    try {
      // In production, use @stacks/connect:
      // import { showConnect } from '@stacks/connect';
      // showConnect({
      //   appDetails: {
      //     name: 'StackSUSU',
      //     icon: window.location.origin + '/logo.png',
      //   },
      //   onFinish: () => {
      //     // Handle connection
      //   },
      //   userSession,
      // });

      // Demo mode - simulate connection
      setIsConnected(true);
      setAddress('SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N');
      setBalance(100.5);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }, []);

  const disconnect = useCallback(() => {
    setIsConnected(false);
    setAddress(null);
    setBalance(0);
  }, []);

  const value: WalletContextType = {
    isConnected,
    address,
    balance,
    connect,
    disconnect,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

export default WalletContext;
