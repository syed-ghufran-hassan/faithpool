import { useState, useCallback } from 'react';
import { CONTRACTS, CORE_FUNCTIONS, CIRCLE_STATUS } from '../lib/contracts';

interface Circle {
  id: number;
  name: string;
  creator: string;
  contribution: number;
  frequency: number;
  maxMembers: number;
  currentMembers: number;
  currentRound: number;
  status: number;
  createdAt: number;
}

interface Member {
  address: string;
  position: number;
  hasDeposited: boolean;
  payoutReceived: boolean;
}

interface UseContractsReturn {
  loading: boolean;
  error: string | null;
  // Read functions
  getCircle: (circleId: number) => Promise<Circle | null>;
  getMember: (circleId: number, address: string) => Promise<Member | null>;
  getCircleCount: () => Promise<number>;
  // Write functions
  createCircle: (name: string, contribution: number, maxMembers: number, frequency: number) => Promise<string>;
  joinCircle: (circleId: number) => Promise<string>;
  deposit: (circleId: number, amount: number) => Promise<string>;
  claimPayout: (circleId: number) => Promise<string>;
}

export function useContracts(): UseContractsReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Read function: Get circle details
  const getCircle = useCallback(async (circleId: number): Promise<Circle | null> => {
    setLoading(true);
    setError(null);
    
    try {
      // In production, use callReadOnlyFunction from @stacks/transactions
      // const result = await callReadOnlyFunction({
      //   contractAddress: CONTRACTS.CORE.split('.')[0],
      //   contractName: CONTRACTS.CORE.split('.')[1],
      //   functionName: CORE_FUNCTIONS.GET_CIRCLE,
      //   functionArgs: [uintCV(circleId)],
      //   network: new StacksMainnet(),
      //   senderAddress: address,
      // });

      // Demo mode - return mock data
      const mockCircle: Circle = {
        id: circleId,
        name: 'Tech Builders',
        creator: 'SP2J6...8K3N',
        contribution: 50,
        frequency: 604800, // 1 week in seconds
        maxMembers: 10,
        currentMembers: 8,
        currentRound: 4,
        status: CIRCLE_STATUS.ACTIVE,
        createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
      };
      
      return mockCircle;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get circle';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Read function: Get member details
  const getMember = useCallback(async (circleId: number, address: string): Promise<Member | null> => {
    setLoading(true);
    setError(null);
    
    try {
      // Demo mode
      const mockMember: Member = {
        address,
        position: 3,
        hasDeposited: true,
        payoutReceived: false,
      };
      
      return mockMember;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get member';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Read function: Get total circle count
  const getCircleCount = useCallback(async (): Promise<number> => {
    setLoading(true);
    setError(null);
    
    try {
      // Demo mode
      return 1248;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get circle count';
      setError(message);
      return 0;
    } finally {
      setLoading(false);
    }
  }, []);

  // Write function: Create a new circle
  const createCircle = useCallback(async (
    name: string, 
    contribution: number, 
    maxMembers: number, 
    frequency: number
  ): Promise<string> => {
    setLoading(true);
    setError(null);
    
    try {
      // In production, use openContractCall from @stacks/connect
      // await openContractCall({
      //   contractAddress: CONTRACTS.CORE.split('.')[0],
      //   contractName: CONTRACTS.CORE.split('.')[1],
      //   functionName: CORE_FUNCTIONS.CREATE_CIRCLE,
      //   functionArgs: [
      //     stringAsciiCV(name),
      //     uintCV(contribution * 1000000), // Convert to microSTX
      //     uintCV(maxMembers),
      //     uintCV(frequency),
      //   ],
      //   onFinish: (data) => {
      //     console.log('Transaction submitted:', data.txId);
      //   },
      // });

      // Demo mode
      console.log('Creating circle:', { name, contribution, maxMembers, frequency });
      return 'demo-tx-' + Date.now();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create circle';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Write function: Join a circle
  const joinCircle = useCallback(async (circleId: number): Promise<string> => {
    setLoading(true);
    setError(null);
    
    try {
      // Demo mode
      console.log('Joining circle:', circleId);
      return 'demo-tx-' + Date.now();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to join circle';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Write function: Deposit to circle
  const deposit = useCallback(async (circleId: number, amount: number): Promise<string> => {
    setLoading(true);
    setError(null);
    
    try {
      // Demo mode
      console.log('Depositing to circle:', { circleId, amount });
      return 'demo-tx-' + Date.now();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to deposit';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Write function: Claim payout
  const claimPayout = useCallback(async (circleId: number): Promise<string> => {
    setLoading(true);
    setError(null);
    
    try {
      // Demo mode
      console.log('Claiming payout from circle:', circleId);
      return 'demo-tx-' + Date.now();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to claim payout';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getCircle,
    getMember,
    getCircleCount,
    createCircle,
    joinCircle,
    deposit,
    claimPayout,
  };
}

export default useContracts;
