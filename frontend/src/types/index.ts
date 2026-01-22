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
