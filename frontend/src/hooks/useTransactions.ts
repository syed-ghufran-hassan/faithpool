// useTransactions hook - manage transaction submissions and tracking

import { useState, useCallback } from 'react';
import { useWallet } from '../context/WalletContext';
import { useToast } from '../context/ToastContext';
import { 
  createCircle,
  joinCircle,
  depositToCircle,
  claimPayout,
  leaveCircle,
  emergencyWithdraw,
  setNFTMinting,
  mintSlotNFT,
  listNFTForSale,
  unlistNFT,
  buyNFT,
} from '../services/wallet';
import type { 
  CreateCircleParams, 
  JoinCircleParams, 
  DepositParams, 
  ClaimPayoutParams,
  EmergencyWithdrawParams,
} from '../types';
import type { TransactionResult } from '../types/blockchain';

export type TransactionType = 
  | 'create-circle'
  | 'join-circle'
  | 'deposit'
  | 'claim-payout'
  | 'leave-circle'
  | 'emergency-withdraw'
  | 'set-nft-minting'
  | 'mint-nft'
  | 'list-nft'
  | 'unlist-nft'
  | 'buy-nft';

interface PendingTransaction {
  id: string;
  type: TransactionType;
  txId?: string;
  circleId?: number;
  amount?: number;
  status: 'pending' | 'submitted' | 'success' | 'failed';
  error?: string;
  createdAt: number;
}

interface UseTransactionsResult {
  pendingTxs: PendingTransaction[];
  isSubmitting: boolean;
  lastError: string | null;
  
  // Circle transactions
  submitCreateCircle: (params: CreateCircleParams) => Promise<TransactionResult | null>;
  submitJoinCircle: (params: JoinCircleParams) => Promise<TransactionResult | null>;
  submitDeposit: (params: DepositParams) => Promise<TransactionResult | null>;
  submitClaimPayout: (params: ClaimPayoutParams) => Promise<TransactionResult | null>;
  submitLeaveCircle: (circleId: number) => Promise<TransactionResult | null>;
  submitEmergencyWithdraw: (params: EmergencyWithdrawParams) => Promise<TransactionResult | null>;
  
  // NFT transactions
  submitSetNFTMinting: (enabled: boolean) => Promise<TransactionResult | null>;
  submitMintNFT: (circleId: number) => Promise<TransactionResult | null>;
  submitListNFT: (tokenId: number, price: number) => Promise<TransactionResult | null>;
  submitUnlistNFT: (tokenId: number) => Promise<TransactionResult | null>;
  submitBuyNFT: (tokenId: number) => Promise<TransactionResult | null>;
  
  // Utilities
  clearPendingTxs: () => void;
  getPendingTxsByCircle: (circleId: number) => PendingTransaction[];
}

let txCounter = 0;

export function useTransactions(): UseTransactionsResult {
  const { isConnected } = useWallet();
  const toast = useToast();
  
  const [pendingTxs, setPendingTxs] = useState<PendingTransaction[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const addPendingTx = useCallback((type: TransactionType, circleId?: number, amount?: number): string => {
    const id = `tx-${++txCounter}-${Date.now()}`;
    const tx: PendingTransaction = {
      id,
      type,
      circleId,
      amount,
      status: 'pending',
      createdAt: Date.now(),
    };
    setPendingTxs(prev => [...prev, tx]);
    return id;
  }, []);

  const updatePendingTx = useCallback((id: string, updates: Partial<PendingTransaction>) => {
    setPendingTxs(prev => 
      prev.map(tx => tx.id === id ? { ...tx, ...updates } : tx)
    );
  }, []);

  const handleTransaction = useCallback(async <T extends TransactionResult>(
    type: TransactionType,
    action: () => Promise<T>,
    successMessage: string,
    circleId?: number,
    amount?: number
  ): Promise<T | null> => {
    if (!isConnected) {
      toast.error('Wallet not connected', 'Please connect your wallet first');
      return null;
    }

    const txId = addPendingTx(type, circleId, amount);
    setIsSubmitting(true);
    setLastError(null);

    try {
      const result = await action();
      
      updatePendingTx(txId, {
        txId: result.txId,
        status: 'submitted',
      });

      toast.success('Transaction Submitted', successMessage);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Transaction failed';
      
      updatePendingTx(txId, {
        status: 'failed',
        error: errorMessage,
      });

      setLastError(errorMessage);
      toast.error('Transaction Failed', errorMessage);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [isConnected, addPendingTx, updatePendingTx, toast]);

  // Circle transactions
  const submitCreateCircle = useCallback(async (params: CreateCircleParams) => {
    return handleTransaction(
      'create-circle',
      () => createCircle(params),
      `Circle "${params.name}" is being created`,
      undefined,
      params.contribution
    );
  }, [handleTransaction]);

  const submitJoinCircle = useCallback(async (params: JoinCircleParams) => {
    return handleTransaction(
      'join-circle',
      () => joinCircle(params),
      `Joining circle #${params.circleId}`,
      params.circleId
    );
  }, [handleTransaction]);

  const submitDeposit = useCallback(async (params: DepositParams) => {
    return handleTransaction(
      'deposit',
      () => depositToCircle(params),
      `Depositing to circle #${params.circleId}`,
      params.circleId
    );
  }, [handleTransaction]);

  const submitClaimPayout = useCallback(async (params: ClaimPayoutParams) => {
    return handleTransaction(
      'claim-payout',
      () => claimPayout(params),
      `Claiming payout from circle #${params.circleId}`,
      params.circleId
    );
  }, [handleTransaction]);

  const submitLeaveCircle = useCallback(async (circleId: number) => {
    return handleTransaction(
      'leave-circle',
      () => leaveCircle(circleId),
      `Leaving circle #${circleId}`,
      circleId
    );
  }, [handleTransaction]);

  const submitEmergencyWithdraw = useCallback(async (params: EmergencyWithdrawParams) => {
    return handleTransaction(
      'emergency-withdraw',
      () => emergencyWithdraw(params),
      `Emergency withdrawal from circle #${params.circleId}`,
      params.circleId
    );
  }, [handleTransaction]);

  // NFT transactions
  const submitSetNFTMinting = useCallback(async (enabled: boolean) => {
    return handleTransaction(
      'set-nft-minting',
      () => setNFTMinting(enabled),
      enabled ? 'NFT minting enabled' : 'NFT minting disabled'
    );
  }, [handleTransaction]);

  const submitMintNFT = useCallback(async (circleId: number) => {
    return handleTransaction(
      'mint-nft',
      () => mintSlotNFT(circleId),
      `Minting NFT for circle #${circleId}`,
      circleId
    );
  }, [handleTransaction]);

  const submitListNFT = useCallback(async (tokenId: number, price: number) => {
    return handleTransaction(
      'list-nft',
      () => listNFTForSale(tokenId, price),
      `Listing NFT #${tokenId} for ${price} STX`
    );
  }, [handleTransaction]);

  const submitUnlistNFT = useCallback(async (tokenId: number) => {
    return handleTransaction(
      'unlist-nft',
      () => unlistNFT(tokenId),
      `Unlisting NFT #${tokenId}`
    );
  }, [handleTransaction]);

  const submitBuyNFT = useCallback(async (tokenId: number) => {
    return handleTransaction(
      'buy-nft',
      () => buyNFT(tokenId),
      `Purchasing NFT #${tokenId}`
    );
  }, [handleTransaction]);

  // Utilities
  const clearPendingTxs = useCallback(() => {
    setPendingTxs([]);
  }, []);

  const getPendingTxsByCircle = useCallback((circleId: number) => {
    return pendingTxs.filter(tx => tx.circleId === circleId);
  }, [pendingTxs]);

  return {
    pendingTxs,
    isSubmitting,
    lastError,
    submitCreateCircle,
    submitJoinCircle,
    submitDeposit,
    submitClaimPayout,
    submitLeaveCircle,
    submitEmergencyWithdraw,
    submitSetNFTMinting,
    submitMintNFT,
    submitListNFT,
    submitUnlistNFT,
    submitBuyNFT,
    clearPendingTxs,
    getPendingTxsByCircle,
  };
}

export default useTransactions;
