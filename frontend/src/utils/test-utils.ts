/**
 * Testing Utilities
 * 
 * Testing helpers and utilities for the StackSUSU application.
 * Provides mocking utilities, test data generators, and testing
 * helpers for Vitest.
 * 
 * @module utils/test-utils
 * 
 * @example
 * ```typescript
 * import { renderWithProviders, mockCircle, mockUser } from '@/utils/test-utils';
 * 
 * test('CircleCard renders correctly', () => {
 *   const circle = mockCircle({ name: 'Test Circle' });
 *   renderWithProviders(<CircleCard circle={circle} />);
 *   expect(screen.getByText('Test Circle')).toBeInTheDocument();
 * });
 * ```
 */

import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import type { ReactElement } from 'react';

// ============================================================================
// Test Data Generators
// ============================================================================

/** Generate a random Stacks address */
export function mockStacksAddress(prefix: 'SP' | 'ST' = 'SP'): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let address = prefix;
  for (let i = 0; i < 38; i++) {
    address += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return address;
}

/** Mock circle data */
export function mockCircle(overrides?: Partial<Circle>): Circle {
  return {
    id: Math.floor(Math.random() * 1000),
    name: 'Test Savings Circle',
    description: 'A test savings circle for unit testing',
    creator: mockStacksAddress(),
    contributionAmount: 1000000, // 1 STX
    maxMembers: 5,
    memberCount: 3,
    currentRound: 1,
    totalRounds: 5,
    status: 'active',
    frequency: 'weekly',
    mode: 'upfront',
    createdAt: Date.now(),
    startBlock: 100000,
    payoutInterval: 7 * 24 * 60 * 60, // 7 days
    minReputation: 0,
    ...overrides,
  };
}

/** Mock user data */
export function mockUser(overrides?: Partial<User>): User {
  const address = mockStacksAddress();
  return {
    address,
    nickname: `User_${address.slice(-6)}`,
    balance: 5000000, // 5 STX
    stxBalance: 5000000,
    reputation: {
      score: 850,
      circlesCompleted: 5,
      circlesDefaulted: 0,
      onTimePayments: 25,
      latePayments: 1,
      totalVolume: 50000000,
    },
    createdAt: Date.now(),
    ...overrides,
  };
}

/** Mock transaction data */
export function mockTransaction(overrides?: Partial<Transaction>): Transaction {
  return {
    txId: `0x${Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('')}`,
    type: 'contract-call',
    contractName: 'stacksusu-core-v7',
    functionName: 'create-circle',
    sender: mockStacksAddress(),
    status: 'success',
    blockHeight: 100000 + Math.floor(Math.random() * 1000),
    timestamp: Date.now(),
    fee: 1000,
    ...overrides,
  };
}

/** Mock contribution data */
export function mockContribution(overrides?: Partial<Contribution>): Contribution {
  return {
    id: Math.floor(Math.random() * 10000),
    circleId: Math.floor(Math.random() * 1000),
    member: mockStacksAddress(),
    amount: 1000000,
    round: 1,
    timestamp: Date.now(),
    blockHeight: 100000,
    txId: mockTransaction().txId,
    ...overrides,
  };
}

// ============================================================================
// Mock Objects
// ============================================================================

/** Mock window.stacks object for wallet testing */
export const mockStacksWallet = (overrides?: Partial<StacksWallet>) => {
  const wallet: StacksWallet = {
    isOpen: false,
    isConnected: false,
    address: null,
    network: 'mainnet',
    
    connect: vi.fn().mockResolvedValue(undefined),
    disconnect: vi.fn().mockResolvedValue(undefined),
    signMessage: vi.fn().mockResolvedValue({ signature: 'mock-signature' }),
    signTransaction: vi.fn().mockResolvedValue({ txId: mockTransaction().txId }),
    
    on: vi.fn(),
    off: vi.fn(),
    
    ...overrides,
  };
  
  (window as any).StacksProvider = wallet;
  return wallet;
};

/** Mock fetch for API testing */
export function mockFetch(response: unknown, status = 200) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(response),
    text: () => Promise.resolve(JSON.stringify(response)),
  });
}

/** Mock localStorage */
export function mockLocalStorage(storage: Record<string, string> = {}) {
  const store = { ...storage };
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    getAll: () => ({ ...store }),
  };
}

/** Mock matchMedia for responsive testing */
export function mockMatchMedia(matches: boolean | string[]) {
  const matchArray = Array.isArray(matches) ? matches : [matches];
  let currentIndex = 0;
  
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: matchArray[currentIndex % matchArray.length],
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
  
  return {
    setMatches: (newMatches: boolean | string[]) => {
      const newArray = Array.isArray(newMatches) ? newMatches : [newMatches];
      currentIndex = 0;
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
          matches: newArray[currentIndex % newArray.length],
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });
    },
  };
}

// ============================================================================
// Custom Render
// ============================================================================

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialState?: Record<string, unknown>;
  route?: string;
}

/** Custom render with providers */
export function renderWithProviders(
  ui: ReactElement,
  options: CustomRenderOptions = {}
) {
  const { initialState, route, ...renderOptions } = options;
  
  // Mock router if route provided
  if (route) {
    window.history.pushState({}, '', route);
  }
  
  return {
    ...render(ui, renderOptions),
    // Return utilities for interacting with the rendered component
    store: initialState,
  };
}

// ============================================================================
// Testing Helpers
// ============================================================================

/** Wait for a specified time */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Wait for element to be removed from DOM */
export async function waitForElementToBeRemoved(
  callback: () => HTMLElement | null,
  timeout = 4500
): Promise<void> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const element = callback();
    if (!element || !document.contains(element)) {
      return;
    }
    await wait(50);
  }
  
  throw new Error('Element was not removed within timeout');
}

/** Simulate user interaction delay */
export async function userDelay(ms: number = 100): Promise<void> {
  await wait(ms);
}

/** Create a mock ResizeObserver */
export function mockResizeObserver() {
  const callbacks = new Map<Element, ResizeObserverCallback>();
  
  global.ResizeObserver = class ResizeObserver {
    constructor(callback: ResizeObserverCallback) {
      this.callback = callback;
    }
    
    private callback: ResizeObserverCallback;
    
    observe(target: Element) {
      callbacks.set(target, this.callback);
    }
    
    unobserve(target: Element) {
      callbacks.delete(target);
    }
    
    disconnect() {
      // Cleanup
    }
    
    static trigger(entries: ResizeObserverEntry[]) {
      callbacks.forEach((callback, target) => {
        const targetEntries = entries.filter(e => e.target === target);
        if (targetEntries.length > 0) {
          callback(targetEntries, this as any);
        }
      });
    }
  };
  
  return {
    trigger: (entries: ResizeObserverEntry[]) => {
      callbacks.forEach((callback, target) => {
        const targetEntries = entries.filter(e => e.target === target);
        if (targetEntries.length > 0) {
          callback(targetEntries, {} as ResizeObserver);
        }
      });
    },
  };
}

/** Mock IntersectionObserver */
export function mockIntersectionObserver(
  isIntersecting: boolean = true
) {
  const callbacks = new Map<Element, IntersectionObserverCallback>();
  
  global.IntersectionObserver = class IntersectionObserver {
    constructor(callback: IntersectionObserverCallback) {
      this.callback = callback;
    }
    
    private callback: IntersectionObserverCallback;
    
    observe(target: Element) {
      callbacks.set(target, this.callback);
      // Immediately trigger with default value
      this.callback(
        [{
          target,
          isIntersecting,
          intersectionRatio: isIntersecting ? 1 : 0,
          boundingClientRect: {} as DOMRectReadOnly,
          intersectionRect: {} as DOMRectReadOnly,
          rootBounds: null,
          time: Date.now(),
        }],
        this
      );
    }
    
    unobserve(target: Element) {
      callbacks.delete(target);
    }
    
    disconnect() {
      callbacks.clear();
    }
    
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  };
  
  return {
    trigger: (entries: Partial<IntersectionObserverEntry>[]) => {
      callbacks.forEach((callback, target) => {
        callback(
          entries.map(e => ({
            target: e.target || target,
            isIntersecting: e.isIntersecting ?? isIntersecting,
            intersectionRatio: e.intersectionRatio ?? (isIntersecting ? 1 : 0),
            boundingClientRect: {} as DOMRectReadOnly,
            intersectionRect: {} as DOMRectReadOnly,
            rootBounds: null,
            time: Date.now(),
            ...e,
          })) as IntersectionObserverEntry[],
          {} as IntersectionObserver
        );
      });
    },
  };
}

// ============================================================================
// Type Definitions
// ============================================================================

interface Circle {
  id: number;
  name: string;
  description?: string;
  creator: string;
  contributionAmount: number;
  maxMembers: number;
  memberCount: number;
  currentRound: number;
  totalRounds: number;
  status: string;
  frequency: string;
  mode: string;
  createdAt: number;
  startBlock: number;
  payoutInterval: number;
  minReputation: number;
}

interface User {
  address: string;
  nickname?: string;
  balance: number;
  stxBalance: number;
  reputation: {
    score: number;
    circlesCompleted: number;
    circlesDefaulted: number;
    onTimePayments: number;
    latePayments: number;
    totalVolume: number;
  };
  createdAt: number;
}

interface Transaction {
  txId: string;
  type: string;
  contractName: string;
  functionName: string;
  sender: string;
  status: string;
  blockHeight: number;
  timestamp: number;
  fee: number;
}

interface Contribution {
  id: number;
  circleId: number;
  member: string;
  amount: number;
  round: number;
  timestamp: number;
  blockHeight: number;
  txId: string;
}

interface StacksWallet {
  isOpen: boolean;
  isConnected: boolean;
  address: string | null;
  network: string;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signMessage: (message: string) => Promise<{ signature: string }>;
  signTransaction: (tx: unknown) => Promise<{ txId: string }>;
  on: (event: string, callback: () => void) => void;
  off: (event: string, callback: () => void) => void;
}
