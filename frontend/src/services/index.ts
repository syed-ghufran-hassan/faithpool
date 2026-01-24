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
