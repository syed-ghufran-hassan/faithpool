import { useState, useCallback } from 'react';

type CopiedValue = string | null;
type CopyFn = (text: string) => Promise<boolean>;

interface UseCopyResult {
  copiedText: CopiedValue;
  copy: CopyFn;
  hasCopied: boolean;
  reset: () => void;
}

function useCopyToClipboard(): UseCopyResult {
  const [copiedText, setCopiedText] = useState<CopiedValue>(null);

  const copy: CopyFn = useCallback(async (text) => {
    if (!navigator?.clipboard) {
      console.warn('Clipboard API not supported');
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      return true;
    } catch (error) {
      console.error('Failed to copy text:', error);
      setCopiedText(null);
      return false;
    }
  }, []);

  const reset = useCallback(() => {
    setCopiedText(null);
  }, []);

  return {
    copiedText,
    copy,
    hasCopied: copiedText !== null,
    reset,
  };
}

export default useCopyToClipboard;
