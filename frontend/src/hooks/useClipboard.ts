import { useState, useCallback } from 'react';

interface UseClipboardOptions {
  /** Duration in ms before resetting copied state */
  timeout?: number;
  /** Callback when copy succeeds */
  onSuccess?: (text: string) => void;
  /** Callback when copy fails */
  onError?: (error: Error) => void;
}

interface UseClipboardReturn {
  /** Whether text was recently copied */
  copied: boolean;
  /** The last copied text */
  copiedText: string | null;
  /** Function to copy text to clipboard */
  copy: (text: string) => Promise<boolean>;
  /** Function to read text from clipboard */
  read: () => Promise<string | null>;
  /** Error if copy/read failed */
  error: Error | null;
  /** Reset the copied state */
  reset: () => void;
}

/**
 * Hook for interacting with the clipboard
 * 
 * @param options - Configuration options
 * @returns Clipboard utilities
 * 
 * @example
 * ```tsx
 * const { copy, copied } = useClipboard({ timeout: 2000 });
 * 
 * return (
 *   <button onClick={() => copy('Hello World!')}>
 *     {copied ? 'Copied!' : 'Copy'}
 *   </button>
 * );
 * ```
 */
export function useClipboard(options: UseClipboardOptions = {}): UseClipboardReturn {
  const { timeout = 2000, onSuccess, onError } = options;
  
  const [copied, setCopied] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      try {
        if (!navigator.clipboard) {
          // Fallback for older browsers
          const textarea = document.createElement('textarea');
          textarea.value = text;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.focus();
          textarea.select();
          
          const success = document.execCommand('copy');
          document.body.removeChild(textarea);
          
          if (!success) {
            throw new Error('execCommand copy failed');
          }
        } else {
          await navigator.clipboard.writeText(text);
        }

        setCopied(true);
        setCopiedText(text);
        setError(null);
        onSuccess?.(text);

        if (timeout > 0) {
          setTimeout(() => {
            setCopied(false);
          }, timeout);
        }

        return true;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to copy');
        setError(error);
        setCopied(false);
        onError?.(error);
        return false;
      }
    },
    [timeout, onSuccess, onError]
  );

  const read = useCallback(async (): Promise<string | null> => {
    try {
      if (!navigator.clipboard) {
        throw new Error('Clipboard API not available');
      }
      
      const text = await navigator.clipboard.readText();
      setError(null);
      return text;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to read clipboard');
      setError(error);
      onError?.(error);
      return null;
    }
  }, [onError]);

  const reset = useCallback(() => {
    setCopied(false);
    setCopiedText(null);
    setError(null);
  }, []);

  return {
    copied,
    copiedText,
    copy,
    read,
    error,
    reset,
  };
}

/**
 * Simple hook to copy text and track copied state
 * 
 * @param timeout - Duration in ms before resetting copied state
 * @returns Tuple of [copy function, copied state]
 * 
 * @example
 * ```tsx
 * const [copy, copied] = useCopy(2000);
 * 
 * return (
 *   <button onClick={() => copy(address)}>
 *     {copied ? '✓' : 'Copy Address'}
 *   </button>
 * );
 * ```
 */
export function useCopy(timeout: number = 2000): [(text: string) => Promise<boolean>, boolean] {
  const { copy, copied } = useClipboard({ timeout });
  return [copy, copied];
}

export default useClipboard;
