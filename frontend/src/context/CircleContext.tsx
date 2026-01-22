import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';

interface Circle {
  id: number;
  name: string;
  contributionAmount: number;
  frequency: string;
  memberCount: number;
  maxMembers: number;
  status: 'open' | 'active' | 'completed';
}

interface CircleContextType {
  circles: Circle[];
  userCircles: Circle[];
  isLoading: boolean;
  error: string | null;
  fetchCircles: () => Promise<void>;
  fetchUserCircles: (address: string) => Promise<void>;
  getCircleById: (id: number) => Circle | undefined;
  refreshCircle: (id: number) => Promise<void>;
}

const CircleContext = createContext<CircleContextType | null>(null);

// Mock data for development
const mockCircles: Circle[] = [
  {
    id: 1,
    name: 'Bitcoin Savers Club',
    contributionAmount: 100,
    frequency: 'weekly',
    memberCount: 8,
    maxMembers: 10,
    status: 'active',
  },
  {
    id: 2,
    name: 'Monthly Stack',
    contributionAmount: 500,
    frequency: 'monthly',
    memberCount: 5,
    maxMembers: 12,
    status: 'open',
  },
  {
    id: 3,
    name: 'Community Fund',
    contributionAmount: 50,
    frequency: 'weekly',
    memberCount: 15,
    maxMembers: 15,
    status: 'completed',
  },
];

export function CircleProvider({ children }: { children: ReactNode }) {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [userCircles, setUserCircles] = useState<Circle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCircles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setCircles(mockCircles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch circles');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchUserCircles = useCallback(async (address: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call filtering by user address
      await new Promise((resolve) => setTimeout(resolve, 500));
      // Mock: return first 2 circles as user's circles
      setUserCircles(mockCircles.slice(0, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user circles');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCircleById = useCallback((id: number) => {
    return circles.find((c) => c.id === id);
  }, [circles]);

  const refreshCircle = useCallback(async (id: number) => {
    // TODO: Refresh single circle data
    await fetchCircles();
  }, [fetchCircles]);

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
