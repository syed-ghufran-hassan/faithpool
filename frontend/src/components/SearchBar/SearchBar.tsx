import { useState, useCallback, useRef, useEffect, memo, forwardRef } from 'react';
import { Search, X } from 'lucide-react';
import clsx from 'clsx';
import { useDebounce } from '../../hooks';
import './SearchBar.css';

export interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  debounceMs?: number;
  showIcon?: boolean;
  showClear?: boolean;
  autoFocus?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
}

export const SearchBar = memo(forwardRef<HTMLDivElement, SearchBarProps>(
  function SearchBar(
    {
      placeholder = 'Search...',
      value: controlledValue,
      onChange,
      onSearch,
      debounceMs = 300,
      showIcon = true,
      showClear = true,
      autoFocus = false,
      disabled = false,
      size = 'md',
      fullWidth = false,
      className,
    },
    ref
  ) {
    const [internalValue, setInternalValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const value = controlledValue !== undefined ? controlledValue : internalValue;
    const { debouncedValue } = useDebounce(value, debounceMs);

    useEffect(() => {
      if (onSearch && debouncedValue !== undefined) {
        onSearch(debouncedValue);
      }
    }, [debouncedValue, onSearch]);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;

        if (controlledValue === undefined) {
          setInternalValue(newValue);
        }

        onChange?.(newValue);
      },
      [controlledValue, onChange]
    );

    const handleClear = useCallback(() => {
      if (controlledValue === undefined) {
        setInternalValue('');
      }
      onChange?.('');
      onSearch?.('');
      inputRef.current?.focus();
    }, [controlledValue, onChange, onSearch]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') {
          handleClear();
        }
      },
      [handleClear]
    );

    const iconSize = size === 'sm' ? 14 : size === 'lg' ? 20 : 16;

    return (
      <div
        ref={ref}
        className={clsx(
          'search-bar',
          disabled && 'search-bar--disabled',
          size !== 'md' && `search-bar--${size}`,
          fullWidth && 'search-bar--full',
          className
        )}
      >
        {showIcon && (
          <span className="search-bar__icon">
            <Search size={iconSize} />
          </span>
        )}

        <input
          ref={inputRef}
          type="text"
          className="search-bar__input"
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          disabled={disabled}
          aria-label="Search"
        />

        {showClear && value && (
          <button
            type="button"
            className="search-bar__clear"
            onClick={handleClear}
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>
    );
  }
));

export default SearchBar;
