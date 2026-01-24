/**
 * Type declarations for @stacks/connect
 * This package doesn't include TypeScript definitions
 */

declare module '@stacks/connect' {
  export interface UserSession {
    loadUserData(): {
      profile: {
        stxAddress: {
          mainnet: string;
          testnet: string;
        };
      };
      appPrivateKey: string;
    };
  }

  export interface AuthResponse {
    userSession: UserSession;
  }

  export interface AppDetails {
    name: string;
    icon: string;
  }

  export interface ShowConnectOptions {
    appDetails: AppDetails;
    onFinish: (data: AuthResponse) => void;
    onCancel?: () => void;
    userSession?: unknown;
  }

  export function showConnect(options: ShowConnectOptions): void;

  export interface ContractCallOptions {
    contractAddress: string;
    contractName: string;
    functionName: string;
    functionArgs: unknown[];
    postConditions?: unknown[];
    network: unknown;
    onFinish: (data: { txId: string; txRaw: string }) => void;
    onCancel?: () => void;
  }

  export function openContractCall(options: ContractCallOptions): void;
}
