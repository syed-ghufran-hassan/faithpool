/**
 * Environment Utilities
 * 
 * Helper functions for environment detection and configuration.
 */

// ===== Environment Detection =====

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
  return import.meta.env.DEV === true;
}

/**
 * Check if running in production mode
 */
export function isProduction(): boolean {
  return import.meta.env.PROD === true;
}

/**
 * Check if running in test mode
 */
export function isTest(): boolean {
  return import.meta.env.MODE === 'test';
}

/**
 * Get current environment mode
 */
export function getMode(): 'development' | 'production' | 'test' {
  if (isTest()) return 'test';
  if (isProduction()) return 'production';
  return 'development';
}

// ===== Browser Detection =====

/**
 * Check if running in browser environment
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Check if running in server environment (SSR)
 */
export function isServer(): boolean {
  return typeof window === 'undefined';
}

/**
 * Check if service workers are supported
 */
export function supportsServiceWorker(): boolean {
  return isBrowser() && 'serviceWorker' in navigator;
}

/**
 * Check if Web Storage is available
 */
export function supportsLocalStorage(): boolean {
  if (!isBrowser()) return false;
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if notifications are supported
 */
export function supportsNotifications(): boolean {
  return isBrowser() && 'Notification' in window;
}

// ===== Platform Detection =====

/**
 * Check if running on macOS
 */
export function isMac(): boolean {
  if (!isBrowser()) return false;
  return navigator.platform.toLowerCase().includes('mac');
}

/**
 * Check if running on Windows
 */
export function isWindows(): boolean {
  if (!isBrowser()) return false;
  return navigator.platform.toLowerCase().includes('win');
}

/**
 * Check if running on mobile device
 */
export function isMobile(): boolean {
  if (!isBrowser()) return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Check if running on iOS
 */
export function isIOS(): boolean {
  if (!isBrowser()) return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/**
 * Check if running on Android
 */
export function isAndroid(): boolean {
  if (!isBrowser()) return false;
  return /Android/i.test(navigator.userAgent);
}

/**
 * Check if running as PWA
 */
export function isPWA(): boolean {
  if (!isBrowser()) return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

// ===== Network Detection =====

/**
 * Get network type (2g, 3g, 4g, etc.)
 */
export function getNetworkType(): string | null {
  if (!isBrowser()) return null;
  const nav = navigator as Navigator & {
    connection?: { effectiveType: string };
  };
  return nav.connection?.effectiveType ?? null;
}

// ===== Feature Detection =====

/**
 * Check if clipboard API is available
 */
export function supportsClipboard(): boolean {
  return isBrowser() && 'clipboard' in navigator;
}

/**
 * Check if geolocation is available
 */
export function supportsGeolocation(): boolean {
  return isBrowser() && 'geolocation' in navigator;
}

/**
 * Check if WebCrypto is available
 */
export function supportsWebCrypto(): boolean {
  return isBrowser() && 'crypto' in window && 'subtle' in window.crypto;
}

/**
 * Check if touch is supported
 */
export function supportsTouch(): boolean {
  if (!isBrowser()) return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// ===== Environment Config =====

/**
 * Get environment variable with fallback
 */
export function getEnvVar(key: string, fallback: string = ''): string {
  const value = import.meta.env[key];
  return typeof value === 'string' ? value : fallback;
}

/**
 * Get network-specific configuration
 */
export function getNetworkConfig() {
  const isMainnet = getEnvVar('VITE_NETWORK', 'mainnet') === 'mainnet';
  
  return {
    network: isMainnet ? 'mainnet' : 'testnet',
    apiUrl: isMainnet 
      ? 'https://api.mainnet.hiro.so'
      : 'https://api.testnet.hiro.so',
    explorerUrl: isMainnet
      ? 'https://explorer.stacks.co'
      : 'https://explorer.stacks.co/?chain=testnet',
  };
}

/**
 * Get contract addresses for current network
 */
export function getContractAddresses() {
  const deployer = getEnvVar(
    'VITE_DEPLOYER_ADDRESS',
    'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N'
  );
  
  return {
    deployer,
    core: `${deployer}.stacksusu-core-v7`,
    admin: `${deployer}.stacksusu-admin-v7`,
    escrow: `${deployer}.stacksusu-escrow-v7`,
    nft: `${deployer}.stacksusu-nft-v7`,
    governance: `${deployer}.stacksusu-governance-v7`,
    reputation: `${deployer}.stacksusu-reputation-v7`,
    referral: `${deployer}.stacksusu-referral-v7`,
  };
}
