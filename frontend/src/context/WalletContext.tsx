import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { 
  connectWallet as connectWalletService,
  disconnectWallet as disconnectWalletService,
  getWalletState,
  subscribeToWallet,
  isWalletAvailable,
} from '../services/wallet';
import { getAccountBalance, getAccountNonce } from '../services/stacks';

interface WalletContextType {
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
  balance: number;
  nonce: number;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  refreshBalance: () => Promise<void>;
  isAvailable: boolean;
}

const WalletContext = createContext<WalletContextType | null>(null);

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [nonce, setNonce] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const isAvailable = isWalletAvailable();

  const refreshBalance = useCallback(async () => {
    if (!address) return;
    
    try {
      const [newBalance, newNonce] = await Promise.all([
        getAccountBalance(address),
        getAccountNonce(address),
      ]);
      
      setBalance(newBalance);
      setNonce(newNonce);
    } catch (err) {
      console.error('Failed to refresh balance:', err);
    }
  }, [address]);

  const connect = useCallback(async () => {
    if (!isAvailable) {
      setError('Hiro Wallet is not installed. Please install it from wallet.hiro.so');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const wallet = await connectWalletService();
      
      setIsConnected(true);
      setAddress(wallet.address);
      setIsConnecting(false);

      // Fetch balance after connection
      if (wallet.address) {
        const [newBalance, newNonce] = await Promise.all([
          getAccountBalance(wallet.address),
          getAccountNonce(wallet.address),
        ]);
        
        setBalance(newBalance);
        setNonce(newNonce);
      }
    } catch (err) {
      setIsConnecting(false);
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    }
  }, [isAvailable]);

  const disconnect = useCallback(() => {
    disconnectWalletService();
    setIsConnected(false);
    setAddress(null);
    setBalance(0);
    setNonce(0);
    setError(null);
  }, []);

  // Subscribe to wallet state changes
  useEffect(() => {
    const unsubscribe = subscribeToWallet((walletState) => {
      setIsConnected(walletState.isConnected);
      setAddress(walletState.address);
    });

    // Check for existing session on mount
    const existingState = getWalletState();
    if (existingState.isConnected && existingState.address) {
      setIsConnected(true);
      setAddress(existingState.address);
    }

    return unsubscribe;
  }, []);

  // Refresh balance periodically when connected
  useEffect(() => {
    if (!isConnected || !address) return;

    refreshBalance();

    const interval = setInterval(refreshBalance, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [isConnected, address, refreshBalance]);

  const value: WalletContextType = {
    isConnected,
    isConnecting,
    address,
    balance,
    nonce,
    error,
    connect,
    disconnect,
    refreshBalance,
    isAvailable,
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

// Convenience hooks
export function useWalletAddress(): string | null {
  const { address } = useWallet();
  return address;
}

export function useWalletBalance(): number {
  const { balance } = useWallet();
  return balance;
}

export function useIsConnected(): boolean {
  const { isConnected } = useWallet();
  return isConnected;
}

export default WalletContext;
