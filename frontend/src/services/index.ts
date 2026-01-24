/**
 * Service layer exports
 * 
 * Provides API and blockchain interaction services
 * @module services
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
