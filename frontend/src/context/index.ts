/**
 * React Context Providers and Hooks for StackSUSU
 * 
 * This module exports all context providers for application-wide state
 * management. Context providers enable shared state across component trees
 * without prop drilling.
 * 
 * @module context
 * 
 * Provider Hierarchy (recommended):
 * ```
 * WalletProvider (outermost - wallet connection)
 *   └─ CircleProvider (circle data management)
 *       └─ ToastProvider (notification system)
 *           └─ App (your application)
 * ```
 * 
 * @example
 * ```tsx
 * // Wrap your app with providers
 * import { WalletProvider, CircleProvider, ToastProvider } from '@/context';
 * 
 * function App() {
 *   return (
 *     <WalletProvider>
 *       <CircleProvider>
 *         <ToastProvider>
 *           <YourApp />
 *         </ToastProvider>
 *       </CircleProvider>
 *     </WalletProvider>
 *   );
 * }
 * 
 * // Use context hooks in components
 * import { useWallet, useCircles, useToastContext } from '@/context';
 * 
 * function Component() {
 *   const { isConnected, address } = useWallet();
 *   const { circles, loading } = useCircles();
 *   const { showToast } = useToastContext();
 * }
 * ```
 * 
 * @packageDocumentation
 */

// ============================================================================
// Wallet Context
// ============================================================================

/**
 * Wallet state management provider and hook.
 * Handles wallet connection, disconnection, balance tracking, and network state.
 */
export { WalletProvider, useWallet } from './WalletContext';

// ============================================================================
// Circle Context
// ============================================================================

/**
 * Circle data management provider and hook.
 * Fetches, caches, and provides access to user circles and circle listings.
 */
export { CircleProvider, useCircles } from './CircleContext';

// ============================================================================
// Toast Context
// ============================================================================

/**
 * Toast notification system provider and hook.
 * Displays temporary notification messages with various severity levels.
 */
export { ToastProvider, useToastContext } from './ToastContext';

// ============================================================================
// Type Exports
// ============================================================================

// Re-export commonly used types for convenience
export type { WalletContextValue } from './WalletContext';
export type { CircleContextValue } from './CircleContext';
export type { ToastContextValue, ToastMessage } from './ToastContext';
export type { Toast, ToastType, ToastPosition } from './ToastContext';
