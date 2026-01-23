import { forwardRef, useId } from 'react';
import type { SelectHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';
import { ChevronDown } from 'lucide-react';
import './Select.css';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export type SelectSize = 'sm' | 'md' | 'lg';

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  selectSize?: SelectSize;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  loading?: boolean;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      hint,
      options,
      selectSize = 'md',
      fullWidth = false,
      leftIcon,
      loading = false,
      disabled = false,
      required = false,
      placeholder,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const selectId = id || generatedId;
    const hasError = !!error;

    return (
      <div 
        className={clsx(
          'select-wrapper',
          { 'select-wrapper--full-width': fullWidth },
          className
        )}
      >
        {label && (
          <label htmlFor={selectId} className="select__label">
            {label}
            {required && <span className="select__required">*</span>}
          </label>
        )}
        
        <div 
          className={clsx(
            'select__container',
            `select__container--${selectSize}`,
            {
              'select__container--error': hasError,
              'select__container--disabled': disabled,
              'select__container--loading': loading,
              'select__container--with-icon': leftIcon,
            }
          )}
        >
          {leftIcon && (
            <span className="select__icon select__icon--left">{leftIcon}</span>
          )}
          
          <select
            ref={ref}
            id={selectId}
            disabled={disabled || loading}
            required={required}
            className="select__field"
            aria-invalid={hasError}
            aria-describedby={
              hasError ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined
            }
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option 
                key={option.value} 
                value={option.value} 
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          
          <span className="select__arrow">
            {loading ? (
              <span className="select__spinner" />
            ) : (
              <ChevronDown size={18} />
            )}
          </span>
        </div>
        
        {hint && !hasError && (
          <span id={`${selectId}-hint`} className="select__hint">
            {hint}
          </span>
        )}
        {hasError && (
          <span id={`${selectId}-error`} className="select__error" role="alert">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };
export type { SelectProps };
export default Select;
