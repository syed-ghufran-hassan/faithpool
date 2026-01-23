import { forwardRef, useId, useState } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { Eye, EyeOff, AlertCircle, Check } from 'lucide-react';
import clsx from 'clsx';
import './Input.css';

export type InputSize = 'sm' | 'md' | 'lg';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  success?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  inputSize?: InputSize;
  showPasswordToggle?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      success = false,
      leftIcon,
      rightIcon,
      inputSize = 'md',
      showPasswordToggle = false,
      type = 'text',
      disabled = false,
      required = false,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const [showPassword, setShowPassword] = useState(false);
    
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;
    
    const hasError = !!error;
    const hasSuccess = success && !hasError;

    const togglePasswordVisibility = () => {
      setShowPassword((prev) => !prev);
    };

    return (
      <div className={clsx('input-wrapper', className)}>
        {label && (
          <label htmlFor={inputId} className="input__label">
            {label}
            {required && <span className="input__required">*</span>}
          </label>
        )}
        
        <div
          className={clsx(
            'input__container',
            `input__container--${inputSize}`,
            {
              'input__container--error': hasError,
              'input__container--success': hasSuccess,
              'input__container--disabled': disabled,
              'input__container--has-left-icon': !!leftIcon,
              'input__container--has-right-icon': !!rightIcon || showPasswordToggle || hasError || hasSuccess,
            }
          )}
        >
          {leftIcon && (
            <span className="input__icon input__icon--left">{leftIcon}</span>
          )}
          
          <input
            ref={ref}
            type={inputType}
            id={inputId}
            disabled={disabled}
            required={required}
            className="input__field"
            aria-invalid={hasError}
            aria-describedby={
              error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            {...props}
          />
          
          {/* Right side icons */}
          <div className="input__icons-right">
            {hasError && (
              <AlertCircle className="input__status-icon input__status-icon--error" size={18} />
            )}
            {hasSuccess && (
              <Check className="input__status-icon input__status-icon--success" size={18} />
            )}
            {isPassword && showPasswordToggle && (
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="input__toggle-password"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            )}
            {rightIcon && !hasError && !hasSuccess && (
              <span className="input__icon input__icon--right">{rightIcon}</span>
            )}
          </div>
        </div>
        
        {hint && !error && (
          <span id={`${inputId}-hint`} className="input__hint">
            {hint}
          </span>
        )}
        {error && (
          <span id={`${inputId}-error`} className="input__error" role="alert">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
export default Input;
