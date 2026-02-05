/**
 * Service Layer Exports
 * 
 * Provides API and blockchain interaction services for the StackSUSU app.
 * 
 * @module services
 * 
 * Services include:
 * - api: HTTP client for backend and Stacks API
 * - stacks: Low-level Stacks blockchain operations
 * - circles: Circle management operations
 * - wallet: Wallet connection and transaction signing
 * - escrow: Escrow balance queries
 * - nft: NFT badge and marketplace operations
 * - analytics: Event tracking and product insights
 * - cache: In-memory and persistent caching
 * - error: Centralized error handling
 * - log: Structured logging
 * - notification: Toast/alert management
 */

// HTTP API client
export * from './api';
export { default as api } from './api';

// Blockchain services
export * from './stacks';
export * from './circles';
export * from './wallet';
export * from './escrow';
export * from './nft';

// Application services
export { analytics } from './analyticsService';
export { cache, CacheKeys } from './cacheService';
export { errorService, ErrorCodes } from './errorService';
export { logger, circleLogger, walletLogger, apiLogger, contractLogger } from './logService';
export { notifications, NotificationType } from './notificationService';
