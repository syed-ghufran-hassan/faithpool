/**
 * Dropdown Component
 * 
 * Flexible dropdown menu with keyboard navigation, positioning,
 * and customizable trigger elements.
 * 
 * @module components/Dropdown
 */

import React, { 
  useState, 
  useRef, 
  useCallback, 
  useEffect, 
  useId,
  createContext,
  useContext,
} from 'react';
import { ChevronDown, Check } from 'lucide-react';
import './Dropdown.css';

// =============================================================================
// Context
// =============================================================================

interface DropdownContextValue {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  triggerId: string;
  menuId: string;
  selectedValue?: string;
  onSelect: (value: string) => void;
}

const DropdownContext = createContext<DropdownContextValue | null>(null);

function useDropdownContext() {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error('Dropdown components must be used within a Dropdown');
  }
  return context;
}

// =============================================================================
// Types
// =============================================================================

export interface DropdownProps {
  /** Controlled open state */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Currently selected value */
  value?: string;
  /** Callback when selection changes */
  onValueChange?: (value: string) => void;
  /** Dropdown content */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

export interface DropdownTriggerProps {
  /** Trigger button content */
  children: React.ReactNode;
  /** Show dropdown indicator arrow */
  showArrow?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
}

export interface DropdownMenuProps {
  /** Menu items */
  children: React.ReactNode;
  /** Menu alignment */
  align?: 'start' | 'center' | 'end';
  /** Menu side */
  side?: 'top' | 'bottom';
  /** Additional CSS classes */
  className?: string;
}

export interface DropdownItemProps {
  /** Item value for selection */
  value?: string;
  /** Item content */
  children: React.ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Show checkmark when selected */
  showCheck?: boolean;
  /** Icon to display before label */
  icon?: React.ReactNode;
  /** Disabled state */
  disabled?: boolean;
  /** Destructive/danger styling */
  destructive?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export interface DropdownSeparatorProps {
  className?: string;
}

export interface DropdownLabelProps {
  children: React.ReactNode;
  className?: string;
}

// =============================================================================
// Dropdown Container
// =============================================================================

export function Dropdown({
  open,
  onOpenChange,
  value,
  onValueChange,
  children,
  className = '',
}: DropdownProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerId = useId();
  const menuId = useId();

  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = useCallback((newOpen: boolean) => {
    if (open === undefined) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  }, [open, onOpenChange]);

  const onSelect = useCallback((newValue: string) => {
    onValueChange?.(newValue);
    setIsOpen(false);
  }, [onValueChange, setIsOpen]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, setIsOpen]);

  const contextValue: DropdownContextValue = {
    isOpen,
    setIsOpen,
    triggerId,
    menuId,
    selectedValue: value,
    onSelect,
  };

  return (
    <DropdownContext.Provider value={contextValue}>
      <div ref={containerRef} className={`dropdown ${className}`}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

// =============================================================================
// Dropdown Trigger
// =============================================================================

export function DropdownTrigger({
  children,
  showArrow = true,
  className = '',
  disabled = false,
}: DropdownTriggerProps) {
  const { isOpen, setIsOpen, triggerId, menuId } = useDropdownContext();

  const handleClick = useCallback(() => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  }, [disabled, isOpen, setIsOpen]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
      event.preventDefault();
      if (!disabled) {
        setIsOpen(true);
      }
    }
  }, [disabled, setIsOpen]);

  return (
    <button
      id={triggerId}
      type="button"
      className={`dropdown__trigger ${isOpen ? 'dropdown__trigger--open' : ''} ${className}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-haspopup="listbox"
      aria-expanded={isOpen}
      aria-controls={menuId}
      disabled={disabled}
    >
      <span className="dropdown__trigger-content">{children}</span>
      {showArrow && (
        <ChevronDown 
          className={`dropdown__trigger-arrow ${isOpen ? 'dropdown__trigger-arrow--open' : ''}`} 
          size={16} 
        />
      )}
    </button>
  );
}

// =============================================================================
// Dropdown Menu
// =============================================================================

export function DropdownMenu({
  children,
  align = 'start',
  side = 'bottom',
  className = '',
}: DropdownMenuProps) {
  const { isOpen, menuId, triggerId } = useDropdownContext();
  const menuRef = useRef<HTMLDivElement>(null);

  // Focus first item when opened
  useEffect(() => {
    if (isOpen && menuRef.current) {
      const firstItem = menuRef.current.querySelector('[role="option"]:not([aria-disabled="true"])');
      if (firstItem instanceof HTMLElement) {
        firstItem.focus();
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      id={menuId}
      role="listbox"
      aria-labelledby={triggerId}
      className={`dropdown__menu dropdown__menu--${align} dropdown__menu--${side} ${className}`}
    >
      {children}
    </div>
  );
}

// =============================================================================
// Dropdown Item
// =============================================================================

export function DropdownItem({
  value,
  children,
  onClick,
  showCheck = false,
  icon,
  disabled = false,
  destructive = false,
  className = '',
}: DropdownItemProps) {
  const { selectedValue, onSelect, setIsOpen } = useDropdownContext();
  const isSelected = value !== undefined && value === selectedValue;

  const handleClick = useCallback(() => {
    if (disabled) return;
    if (value !== undefined) {
      onSelect(value);
    }
    onClick?.();
    setIsOpen(false);
  }, [disabled, value, onSelect, onClick, setIsOpen]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  return (
    <div
      role="option"
      aria-selected={isSelected}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      className={`dropdown__item ${isSelected ? 'dropdown__item--selected' : ''} ${disabled ? 'dropdown__item--disabled' : ''} ${destructive ? 'dropdown__item--destructive' : ''} ${className}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {showCheck && (
        <span className="dropdown__item-check">
          {isSelected && <Check size={14} />}
        </span>
      )}
      {icon && <span className="dropdown__item-icon">{icon}</span>}
      <span className="dropdown__item-label">{children}</span>
    </div>
  );
}

// =============================================================================
// Dropdown Separator
// =============================================================================

export function DropdownSeparator({ className = '' }: DropdownSeparatorProps) {
  return <div className={`dropdown__separator ${className}`} role="separator" />;
}

// =============================================================================
// Dropdown Label
// =============================================================================

export function DropdownLabel({ children, className = '' }: DropdownLabelProps) {
  return <div className={`dropdown__label ${className}`}>{children}</div>;
}

export default Dropdown;
