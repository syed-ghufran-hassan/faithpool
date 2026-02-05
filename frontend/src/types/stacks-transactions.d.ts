/**
 * Type declarations for @stacks/transactions
 * Minimal types for what we use in StackSUSU
 */

declare module '@stacks/transactions' {
  export function uintCV(value: number | bigint | string): unknown;
  export function stringAsciiCV(value: string): unknown;
  export function stringUtf8CV(value: string): unknown;
  export function boolCV(value: boolean): unknown;
  export function principalCV(address: string): unknown;
  export function optionalCVOf(value: unknown): unknown;
  export function noneCV(): unknown;
  export function someCV(value: unknown): unknown;
  export function tupleCV(data: Record<string, unknown>): unknown;
  export function listCV(values: unknown[]): unknown;
  export function bufferCV(buffer: Uint8Array): unknown;
  export function serializeCV(cv: unknown): Uint8Array;
  export function deserializeCV(buffer: Uint8Array): unknown;
}
