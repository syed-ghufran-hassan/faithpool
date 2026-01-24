/**
 * React Context Providers and Hooks
 * 
 * This module exports all context providers for app-wide state management.
 * Wrap your app with these providers to enable their functionality.
 * 
 * @module context
 * 
 * @example
 * ```tsx
 * <WalletProvider>
 *   <CircleProvider>
 *     <ToastProvider>
 *       <App />
 *     </ToastProvider>
 *   </CircleProvider>
 * </WalletProvider>
 * ```
 */

// Wallet state management - handles wallet connection and balance
export { WalletProvider, useWallet } from './WalletContext';

// Circle data management - fetches and caches circle data
export { CircleProvider, useCircles } from './CircleContext';

// Toast notification system - displays toast messages
export { ToastProvider, useToastContext } from './ToastContext';

// Re-export types for convenience
export type { Toast, ToastType, ToastPosition } from './ToastContext';
