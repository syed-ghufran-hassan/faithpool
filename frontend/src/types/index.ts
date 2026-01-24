/**
 * Type definitions for StackSUSU
 * 
 * @module types
 */

// Circle types
export interface Circle {
  id: number;
  name: string;
  description?: string;
  creator: string;
  contribution: number;
  frequency: CircleFrequency;
  maxMembers: number;
  currentMembers: number;
  currentRound: number;
  totalRounds: number;
  status: CircleStatus;
  createdAt: string;
  totalPool?: number;
  nextPayout?: string;
}

export type CircleStatus = 'forming' | 'active' | 'completed' | 'cancelled';

export type CircleFrequency = 'weekly' | 'biweekly' | 'monthly';

// Member types
export interface Member {
  address: string;
  position: number;
  contributed: boolean;
  payoutReceived: boolean;
  joinedAt?: string;
}

// Transaction types
export interface Transaction {
  id: string;
  type: TransactionType;
  circleId: number;
  circleName: string;
  amount: number;
  from?: string;
  to?: string;
  timestamp: string;
  status: TransactionStatus;
  txId?: string;
}

export type TransactionType = 'contribution' | 'payout' | 'emergency_payout' | 'join' | 'create';

export type TransactionStatus = 'pending' | 'confirmed' | 'failed';

// User types
export interface User {
  address: string;
  balance: number;
  totalSaved: number;
  activeCircles: number;
  completedCircles: number;
  reputation: number;
  nftBadges: NFTBadge[];
}

export interface NFTBadge {
  id: number;
  name: string;
  description: string;
  imageUri: string;
  earnedAt: string;
}

// Activity types
export interface Activity {
  id: string;
  type: ActivityType;
  circle: string;
  amount?: number;
  date: string;
  description?: string;
}

export type ActivityType = 'contribution' | 'payout' | 'joined' | 'badge' | 'created';

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Form types
export interface CreateCircleForm {
  name: string;
  description: string;
  maxMembers: number;
  contribution: number;
  frequency: CircleFrequency;
  isPrivate: boolean;
}

// Stats types
export interface GlobalStats {
  totalCircles: number;
  totalMembers: number;
  totalSaved: number;
  payoutSuccessRate: number;
}

export interface UserStats {
  totalSaved: number;
  activeCircles: number;
  completedCircles: number;
  reputation: number;
  nextPayout?: string;
  nftBadges: number;
}

// Re-export blockchain types
export * from './blockchain';

// Circle creation parameters for contract calls
export interface CreateCircleParams {
  name: string;
  contribution: number;       // In STX
  maxMembers: number;
  payoutIntervalDays: number;
}

// Join circle parameters
export interface JoinCircleParams {
  circleId: number;
  referrer?: string;          // Optional referral address
}

// Deposit parameters
export interface DepositParams {
  circleId: number;
}

// Claim payout parameters
export interface ClaimPayoutParams {
  circleId: number;
}

// Emergency withdraw parameters
export interface EmergencyWithdrawParams {
  circleId: number;
}

// Toast notification
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Theme
export type Theme = 'light' | 'dark' | 'system';

// App settings
export interface AppSettings {
  theme: Theme;
  notifications: {
    payoutReminders: boolean;
    depositReminders: boolean;
    circleUpdates: boolean;
    marketplaceAlerts: boolean;
  };
  display: {
    currency: 'STX' | 'USD';
    compactNumbers: boolean;
    showTestnet: boolean;
  };
}
