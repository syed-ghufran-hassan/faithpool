/**
 * Circle Context Provider
 * 
 * Manages circle data state and provides circle operations
 * throughout the application via React Context.
 * 
 * @module context/CircleContext
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { getAllCircles, getCircleById as fetchCircleById, getUserMemberships, formatCircleForDisplay } from '../services/circles';
import type { OnChainCircle } from '../types/blockchain';

// ============================================================
// Types
// ============================================================

/** UI-friendly circle representation */
interface Circle {
  id: number;
  name: string;
  contributionAmount: number;
  frequency: string;
  memberCount: number;
  maxMembers: number;
  status: 'open' | 'active' | 'completed';
  creator?: string;
  currentRound?: number;
  payoutInterval?: number;
  escrowBalance?: number;
}

/** Circle context value type */
interface CircleContextType {
  /** All available circles */
  circles: Circle[];
  /** Circles user is a member of */
  userCircles: Circle[];
  /** Loading state */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;
  /** Fetch all circles */
  fetchCircles: () => Promise<void>;
  /** Fetch circles for a specific user */
  fetchUserCircles: (address: string) => Promise<void>;
  /** Get circle by ID from cache */
  getCircleById: (id: number) => Circle | undefined;
  /** Refresh a specific circle */
  refreshCircle: (id: number) => Promise<void>;
  /** Total number of circles */
  totalCircleCount: number;
}

// ============================================================
// Context
// ============================================================

const CircleContext = createContext<CircleContextType | null>(null);

// ============================================================
// Helpers
// ============================================================

/**
 * Transform on-chain circle data to UI-friendly format
 * @param onChain - Raw on-chain circle data
 */
function transformCircle(onChain: OnChainCircle): Circle {
  const display = formatCircleForDisplay(onChain);
  
  // Map status number to status string
  let status: 'open' | 'active' | 'completed' = 'open';
  if (onChain.status === 1) status = 'active';
  else if (onChain.status === 2) status = 'completed';
  else if (onChain.status === 0 && onChain.currentMembers >= onChain.maxMembers) status = 'active';
  
  // Calculate frequency from payout interval (blocks)
  let frequency = 'weekly';
  const daysPerPayout = onChain.payoutInterval / 144; // ~144 blocks per day
  if (daysPerPayout >= 25) frequency = 'monthly';
  else if (daysPerPayout >= 12) frequency = 'biweekly';
  
  return {
    id: onChain.id,
    name: onChain.name,
    contributionAmount: onChain.contribution / 1_000_000, // Convert to STX
    frequency,
    memberCount: onChain.currentMembers,
    maxMembers: onChain.maxMembers,
    status,
    creator: onChain.creator,
    currentRound: onChain.currentRound,
    payoutInterval: onChain.payoutInterval,
    escrowBalance: display.escrowBalance,
  };
}

// ============================================================
// Provider Component
// ============================================================

/**
 * Circle context provider component
 * Wrap your app with this to enable circle data access
 */
export function CircleProvider({ children }: { children: ReactNode }) {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [userCircles, setUserCircles] = useState<Circle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCircleCount, setTotalCircleCount] = useState(0);

  const fetchCircles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const onChainCircles = await getAllCircles(50); // Fetch up to 50 circles
      const transformed = onChainCircles.map(transformCircle);
      setCircles(transformed);
      setTotalCircleCount(onChainCircles.length);
    } catch (err) {
      console.error('Failed to fetch circles:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch circles');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchUserCircles = useCallback(async (address: string) => {
    if (!address) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const memberships = await getUserMemberships(address, 20);
      const circlePromises = memberships.map(m => fetchCircleById(m.circleId));
      const onChainCircles = await Promise.all(circlePromises);
      const validCircles = onChainCircles.filter((c): c is OnChainCircle => c !== null);
      const transformed = validCircles.map(transformCircle);
      setUserCircles(transformed);
    } catch (err) {
      console.error('Failed to fetch user circles:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch user circles');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCircleById = useCallback((id: number) => {
    return circles.find((c) => c.id === id);
  }, [circles]);

  const refreshCircle = useCallback(async (id: number) => {
    try {
      const onChain = await fetchCircleById(id);
      if (onChain) {
        const transformed = transformCircle(onChain);
        setCircles(prev => prev.map(c => c.id === id ? transformed : c));
        setUserCircles(prev => prev.map(c => c.id === id ? transformed : c));
      }
    } catch (err) {
      console.error('Failed to refresh circle:', err);
    }
  }, []);

  // Load circles on mount
  useEffect(() => {
    fetchCircles();
  }, [fetchCircles]);

  return (
    <CircleContext.Provider
      value={{
        circles,
        userCircles,
        isLoading,
        error,
        fetchCircles,
        fetchUserCircles,
        getCircleById,
        refreshCircle,
        totalCircleCount,
      }}
    >
      {children}
    </CircleContext.Provider>
  );
}

export function useCircles() {
  const context = useContext(CircleContext);
  if (!context) {
    throw new Error('useCircles must be used within a CircleProvider');
  }
  return context;
}

export default CircleContext;
