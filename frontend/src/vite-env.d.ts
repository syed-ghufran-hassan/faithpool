/**
 * StackSUSU Frontend Type Declarations
 * 
 * Global type declarations for Vite environment and custom modules.
 */

/// <reference types="vite/client" />

/**
 * Environment variables available via import.meta.env
 */
interface ImportMetaEnv {
  /** Stacks network: mainnet, testnet, or devnet */
  readonly VITE_STACKS_NETWORK: 'mainnet' | 'testnet' | 'devnet';
  /** Contract deployer address */
  readonly VITE_CONTRACT_ADDRESS: string;
  /** Contract version (v3, v4, v5) */
  readonly VITE_CONTRACT_VERSION: string;
  /** API URL (optional) */
  readonly VITE_API_URL?: string;
  /** Enable NFT marketplace feature */
  readonly VITE_ENABLE_NFT_MARKETPLACE?: string;
  /** Enable referrals feature */
  readonly VITE_ENABLE_REFERRALS?: string;
  /** Enable governance feature */
  readonly VITE_ENABLE_GOVERNANCE?: string;
  /** Analytics ID (optional) */
  readonly VITE_ANALYTICS_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/**
 * CSS Module declarations
 */
declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

/**
 * Image asset declarations
 */
declare module '*.svg' {
  import type { FC, SVGProps } from 'react';
  const content: FC<SVGProps<SVGSVGElement>>;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.gif' {
  const content: string;
  export default content;
}

declare module '*.webp' {
  const content: string;
  export default content;
}

/**
 * JSON module declarations
 */
declare module '*.json' {
  const content: Record<string, unknown>;
  export default content;
}
