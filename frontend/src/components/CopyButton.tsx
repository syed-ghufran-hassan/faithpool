/**
 * CopyButton Component
 * 
 * One-click copy-to-clipboard functionality with visual feedback.
 * Perfect for copying addresses, IDs, and other text values.
 * 
 * @module components/CopyButton
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Copy, Check, AlertCircle } from 'lucide-react';
import './CopyButton.css';

export interface CopyButtonProps {
  /** Text to copy to clipboard */
  text: string;
  /** Duration to show success state (ms) */
  successDuration?: number;
  /** Button label (hidden by default, shown on hover) */
  label?: string;
  /** Show tooltip on hover */
  showTooltip?: boolean;
  /** Tooltip position */
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Button variant */
  variant?: 'ghost' | 'outline' | 'solid';
  /** Callback after successful copy */
  onCopy?: (text: string) => void;
  /** Callback on copy error */
  onError?: (error: Error) => void;
  /** Disabled state */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** ARIA label for accessibility */
  ariaLabel?: string;
}

type CopyState = 'idle' | 'copied' | 'error';

/**
 * Copy to clipboard button with visual feedback
 * 
 * @example
 * ```tsx
 * <CopyButton 
 *   text="SP3FKN...G94ZH1" 
 *   label="Copy Address"
 *   onCopy={() => toast.success('Address copied!')}
 * />
 * ```
 */
export function CopyButton({
  text,
  successDuration = 2000,
  label,
  showTooltip = true,
  tooltipPosition = 'top',
  size = 'md',
  variant = 'ghost',
  onCopy,
  onError,
  disabled = false,
  className = '',
  ariaLabel = 'Copy to clipboard',
}: CopyButtonProps) {
  const [state, setState] = useState<CopyState>('idle');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCopy = useCallback(async () => {
    if (disabled || !text) return;

    try {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Use modern clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      setState('copied');
      onCopy?.(text);

      timeoutRef.current = setTimeout(() => {
        setState('idle');
      }, successDuration);
    } catch (error) {
      setState('error');
      onError?.(error instanceof Error ? error : new Error('Failed to copy'));

      timeoutRef.current = setTimeout(() => {
        setState('idle');
      }, successDuration);
    }
  }, [text, disabled, successDuration, onCopy, onError]);

  const getIcon = () => {
    switch (state) {
      case 'copied':
        return <Check className="copy-button__icon copy-button__icon--success" />;
      case 'error':
        return <AlertCircle className="copy-button__icon copy-button__icon--error" />;
      default:
        return <Copy className="copy-button__icon" />;
    }
  };

  const getTooltipText = () => {
    switch (state) {
      case 'copied':
        return 'Copied!';
      case 'error':
        return 'Failed to copy';
      default:
        return label || 'Copy';
    }
  };

  const iconSize = size === 'lg' ? 18 : size === 'md' ? 16 : 14;

  return (
    <button
      type="button"
      className={`copy-button copy-button--${size} copy-button--${variant} copy-button--${state} ${className}`}
      onClick={handleCopy}
      disabled={disabled || !text}
      aria-label={ariaLabel}
      data-tooltip={showTooltip ? getTooltipText() : undefined}
      data-tooltip-position={tooltipPosition}
    >
      {React.cloneElement(getIcon(), { size: iconSize })}
      {label && <span className="copy-button__label">{label}</span>}
    </button>
  );
}

/**
 * Inline copy component that displays text with a copy button
 */
export interface CopyTextProps {
  /** Text to display and copy */
  text: string;
  /** Truncate text display */
  truncate?: boolean;
  /** Maximum characters to show when truncated */
  maxLength?: number;
  /** Format as address (show first and last characters) */
  formatAsAddress?: boolean;
  /** Callback after successful copy */
  onCopy?: (text: string) => void;
  /** Additional CSS classes */
  className?: string;
}

export function CopyText({
  text,
  truncate = false,
  maxLength = 20,
  formatAsAddress = false,
  onCopy,
  className = '',
}: CopyTextProps) {
  const displayText = (() => {
    if (formatAsAddress && text.length > 12) {
      return `${text.slice(0, 6)}...${text.slice(-4)}`;
    }
    if (truncate && text.length > maxLength) {
      return `${text.slice(0, maxLength)}...`;
    }
    return text;
  })();

  return (
    <div className={`copy-text ${className}`}>
      <code className="copy-text__value" title={text}>
        {displayText}
      </code>
      <CopyButton text={text} size="sm" onCopy={onCopy} />
    </div>
  );
}

export default CopyButton;
