import React, { useState, useCallback, forwardRef } from 'react';
import './AmountInput.css';

export interface AmountInputProps {
  /** Current value in STX (not microSTX) */
  value: string;
  /** Called when value changes */
  onChange: (value: string) => void;
  /** Currency symbol/label */
  currency?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Step increment for +/- buttons */
  step?: number;
  /** Number of decimal places allowed */
  decimals?: number;
  /** Whether input is disabled */
  disabled?: boolean;
  /** Error message */
  error?: string;
  /** Help text */
  hint?: string;
  /** Label text */
  label?: string;
  /** Show increment/decrement buttons */
  showButtons?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional className */
  className?: string;
}

/**
 * Amount input component for STX values
 * 
 * @example
 * ```tsx
 * const [amount, setAmount] = useState('');
 * 
 * <AmountInput
 *   label="Contribution Amount"
 *   value={amount}
 *   onChange={setAmount}
 *   min={0.1}
 *   max={1000}
 *   currency="STX"
 *   hint="Enter amount between 0.1 and 1000 STX"
 * />
 * ```
 */
export const AmountInput = forwardRef<HTMLInputElement, AmountInputProps>(
  function AmountInput(
    {
      value,
      onChange,
      currency = 'STX',
      placeholder = '0.00',
      min,
      max,
      step = 1,
      decimals = 6,
      disabled = false,
      error,
      hint,
      label,
      showButtons = false,
      size = 'md',
      className = '',
    },
    ref
  ) {
    const [isFocused, setIsFocused] = useState(false);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;

        // Allow empty string
        if (inputValue === '') {
          onChange('');
          return;
        }

        // Validate numeric input with decimals
        const regex = new RegExp(`^\\d*\\.?\\d{0,${decimals}}$`);
        if (regex.test(inputValue)) {
          onChange(inputValue);
        }
      },
      [onChange, decimals]
    );

    const handleIncrement = useCallback(() => {
      const numValue = parseFloat(value) || 0;
      const newValue = numValue + step;
      if (max === undefined || newValue <= max) {
        onChange(newValue.toFixed(decimals > 2 ? 2 : decimals));
      }
    }, [value, step, max, decimals, onChange]);

    const handleDecrement = useCallback(() => {
      const numValue = parseFloat(value) || 0;
      const newValue = numValue - step;
      if (min === undefined || newValue >= min) {
        onChange(Math.max(0, newValue).toFixed(decimals > 2 ? 2 : decimals));
      }
    }, [value, step, min, decimals, onChange]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          handleIncrement();
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          handleDecrement();
        }
      },
      [handleIncrement, handleDecrement]
    );

    const numValue = parseFloat(value);
    const isUnderMin = min !== undefined && numValue < min;
    const isOverMax = max !== undefined && numValue > max;
    const hasError = !!error || isUnderMin || isOverMax;

    return (
      <div className={`amount-input-wrapper ${className}`}>
        {label && (
          <label className="amount-input__label">{label}</label>
        )}
        <div
          className={`
            amount-input
            amount-input--${size}
            ${isFocused ? 'amount-input--focused' : ''}
            ${hasError ? 'amount-input--error' : ''}
            ${disabled ? 'amount-input--disabled' : ''}
          `}
        >
          {showButtons && (
            <button
              type="button"
              className="amount-input__button amount-input__button--decrement"
              onClick={handleDecrement}
              disabled={disabled || (min !== undefined && (numValue <= min || !value))}
              aria-label="Decrease amount"
            >
              −
            </button>
          )}
          <div className="amount-input__field">
            <input
              ref={ref}
              type="text"
              inputMode="decimal"
              value={value}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              disabled={disabled}
              aria-invalid={hasError}
              aria-describedby={error || hint ? 'amount-hint' : undefined}
            />
            <span className="amount-input__currency">{currency}</span>
          </div>
          {showButtons && (
            <button
              type="button"
              className="amount-input__button amount-input__button--increment"
              onClick={handleIncrement}
              disabled={disabled || (max !== undefined && numValue >= max)}
              aria-label="Increase amount"
            >
              +
            </button>
          )}
        </div>
        {(error || hint || isUnderMin || isOverMax) && (
          <p
            id="amount-hint"
            className={`amount-input__hint ${hasError ? 'amount-input__hint--error' : ''}`}
          >
            {error || (isUnderMin ? `Minimum: ${min} ${currency}` : isOverMax ? `Maximum: ${max} ${currency}` : hint)}
          </p>
        )}
      </div>
    );
  }
);

/**
 * Quick amount selection buttons
 */
export function QuickAmounts({
  amounts,
  onSelect,
  selected,
  currency = 'STX',
  className = '',
}: {
  amounts: number[];
  onSelect: (amount: number) => void;
  selected?: number;
  currency?: string;
  className?: string;
}) {
  return (
    <div className={`quick-amounts ${className}`}>
      {amounts.map((amount) => (
        <button
          key={amount}
          type="button"
          onClick={() => onSelect(amount)}
          className={`quick-amounts__button ${selected === amount ? 'quick-amounts__button--selected' : ''}`}
        >
          {amount} {currency}
        </button>
      ))}
    </div>
  );
}

export default AmountInput;
