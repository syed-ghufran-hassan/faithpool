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
import { getAllCircles, getCircleInfo, getUserCircles } from '../services/circles';
import type { Circle } from '../types';

// ============================================================
// Types
// ============================================================

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
      const fetchedCircles = await getAllCircles(1, 50); // Fetch up to 50 circles
      setCircles(fetchedCircles);
      setTotalCircleCount(fetchedCircles.length);
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
      const fetchedUserCircles = await getUserCircles(address);
      setUserCircles(fetchedUserCircles);
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
      const circleInfo = await getCircleInfo(id);
      if (circleInfo) {
        // Create a Circle object from the CircleInfo
        const refreshedCircle: Circle = {
          id,
          name: circleInfo.name,
          creator: circleInfo.creator,
          contribution: circleInfo.contribution,
          frequency: 'monthly', // Default frequency
          maxMembers: circleInfo.maxMembers,
          currentMembers: circleInfo.memberCount,
          currentRound: circleInfo.currentRound,
          totalRounds: circleInfo.maxMembers,
          status: (circleInfo.status as unknown as number) === 0 ? 'forming' 
               : (circleInfo.status as unknown as number) === 1 ? 'active' 
               : 'completed',
          createdAt: new Date().toISOString(),
        };
        setCircles(prev => prev.map(c => c.id === id ? refreshedCircle : c));
        setUserCircles(prev => prev.map(c => c.id === id ? refreshedCircle : c));
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
