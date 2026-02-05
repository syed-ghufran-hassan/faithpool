/**
 * Custom React hooks for StackSUSU
 * 
 * @module hooks
 */

// Blockchain & wallet hooks
export { useContracts } from './useContracts';
export { useBalance, useTransactions as useStacksTransactions } from './useStacks';
export { useBlockchain, useTransactionHistory } from './useBlockchain';
export { useCircleDetails } from './useCircleDetails';
export { useTransactions } from './useTransactions';
export { useUserNFTs, useMarketplace, useNFTDetails } from './useNFTs';

// Circle management hooks
export { useCircle } from './useCircle';
export { useEscrow } from './useEscrow';
export { useReputation } from './useReputation';

// UI & state hooks
export { useTheme } from './useTheme';
export { useToast } from './useToast';
export { default as useForm } from './useForm';
export { default as useLocalStorage } from './useLocalStorage';

// Utility hooks
export { useDebounce, useDebouncedCallback } from './useDebounce';
export { default as useCopyToClipboard } from './useCopyToClipboard';
export { 
  useMediaQuery,
  useIsMobile,
  useIsSmUp,
  useIsMdUp,
  useIsLgUp,
  useIsXlUp,
  usePrefersReducedMotion,
  usePrefersDarkMode,
  usePrefersLightMode,
  useHasHover,
  useIsTouchDevice,
  useIsPortrait,
  useIsLandscape,
} from './useMediaQuery';
