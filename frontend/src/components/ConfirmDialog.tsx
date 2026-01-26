import React, { useState, useCallback, createContext, useContext } from 'react';
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';
import './ConfirmDialog.css';

export type ConfirmDialogVariant = 'danger' | 'warning' | 'info' | 'success';

export interface ConfirmDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Called when dialog should close */
  onClose: () => void;
  /** Called when confirmed */
  onConfirm: () => void | Promise<void>;
  /** Dialog title */
  title: string;
  /** Dialog message/description */
  message: React.ReactNode;
  /** Confirm button text */
  confirmText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Visual variant */
  variant?: ConfirmDialogVariant;
  /** Whether to show loading state on confirm */
  loading?: boolean;
  /** Whether confirm is disabled */
  disabled?: boolean;
}

const variantConfig = {
  danger: {
    icon: XCircle,
    iconClass: 'confirm-dialog__icon--danger',
    buttonClass: 'confirm-dialog__button--danger',
  },
  warning: {
    icon: AlertTriangle,
    iconClass: 'confirm-dialog__icon--warning',
    buttonClass: 'confirm-dialog__button--warning',
  },
  info: {
    icon: Info,
    iconClass: 'confirm-dialog__icon--info',
    buttonClass: 'confirm-dialog__button--info',
  },
  success: {
    icon: CheckCircle,
    iconClass: 'confirm-dialog__icon--success',
    buttonClass: 'confirm-dialog__button--success',
  },
};

/**
 * Confirmation dialog component for destructive or important actions
 * 
 * @example
 * ```tsx
 * <ConfirmDialog
 *   isOpen={showConfirm}
 *   onClose={() => setShowConfirm(false)}
 *   onConfirm={handleDelete}
 *   title="Delete Circle"
 *   message="Are you sure you want to delete this circle? This action cannot be undone."
 *   variant="danger"
 *   confirmText="Delete"
 * />
 * ```
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
  disabled = false,
}: ConfirmDialogProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  
  const config = variantConfig[variant];
  const Icon = config.icon;

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Confirm action failed:', error);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="confirm-dialog__overlay"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div 
        className="confirm-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="confirm-dialog__header">
          <div className={`confirm-dialog__icon ${config.iconClass}`}>
            <Icon size={24} />
          </div>
          <h2 id="confirm-dialog-title" className="confirm-dialog__title">
            {title}
          </h2>
        </div>
        
        <div className="confirm-dialog__body">
          {typeof message === 'string' ? (
            <p className="confirm-dialog__message">{message}</p>
          ) : (
            message
          )}
        </div>
        
        <div className="confirm-dialog__footer">
          <button
            type="button"
            className="confirm-dialog__button confirm-dialog__button--cancel"
            onClick={onClose}
            disabled={isConfirming || loading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`confirm-dialog__button ${config.buttonClass}`}
            onClick={handleConfirm}
            disabled={isConfirming || loading || disabled}
          >
            {isConfirming || loading ? (
              <span className="confirm-dialog__loading">
                <span className="confirm-dialog__spinner" />
                Processing...
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Context-based confirm dialog for imperative usage

interface ConfirmOptions {
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmDialogVariant;
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

/**
 * Provider for imperative confirm dialog usage
 * 
 * @example
 * ```tsx
 * // In app root
 * <ConfirmProvider>
 *   <App />
 * </ConfirmProvider>
 * 
 * // In component
 * const { confirm } = useConfirm();
 * 
 * const handleDelete = async () => {
 *   const confirmed = await confirm({
 *     title: 'Delete Item',
 *     message: 'Are you sure?',
 *     variant: 'danger',
 *   });
 *   if (confirmed) {
 *     deleteItem();
 *   }
 * };
 * ```
 */
export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions | null;
    resolve: ((value: boolean) => void) | null;
  }>({
    isOpen: false,
    options: null,
    resolve: null,
  });

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        isOpen: true,
        options,
        resolve,
      });
    });
  }, []);

  const handleClose = useCallback(() => {
    state.resolve?.(false);
    setState({ isOpen: false, options: null, resolve: null });
  }, [state.resolve]);

  const handleConfirm = useCallback(() => {
    state.resolve?.(true);
    setState({ isOpen: false, options: null, resolve: null });
  }, [state.resolve]);

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {state.options && (
        <ConfirmDialog
          isOpen={state.isOpen}
          onClose={handleClose}
          onConfirm={handleConfirm}
          title={state.options.title}
          message={state.options.message}
          confirmText={state.options.confirmText}
          cancelText={state.options.cancelText}
          variant={state.options.variant}
        />
      )}
    </ConfirmContext.Provider>
  );
}

/**
 * Hook to use the confirm dialog imperatively
 */
export function useConfirm(): ConfirmContextValue {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
}

export default ConfirmDialog;
