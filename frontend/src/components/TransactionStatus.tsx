// TransactionStatus component - Display transaction progress

import { memo, useCallback, forwardRef, type ReactNode } from 'react';
import { Check, X, ExternalLink, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { useBlockchain } from '../hooks/useBlockchain';
import './TransactionStatus.css';

export type TxStatus = 'pending' | 'submitted' | 'success' | 'failed';

export interface TransactionStatusProps {
  txId?: string;
  status: TxStatus;
  title: string;
  description?: string;
  onViewExplorer?: () => void;
  onClose?: () => void;
  className?: string;
}

export interface TransactionToastProps {
  txId?: string;
  status: TxStatus;
  message: string;
  className?: string;
}

const STATUS_CONFIG: Record<TxStatus, { label: string; iconClass: string }> = {
  pending: { label: 'Preparing...', iconClass: 'tx-status__icon--pending' },
  submitted: { label: 'Processing...', iconClass: 'tx-status__icon--submitted' },
  success: { label: 'Confirmed', iconClass: 'tx-status__icon--success' },
  failed: { label: 'Failed', iconClass: 'tx-status__icon--failed' },
};

function getStatusIcon(status: TxStatus): ReactNode {
  const isLoading = status === 'pending' || status === 'submitted';
  
  if (isLoading) {
    return (
      <span className={clsx('tx-status__icon', STATUS_CONFIG[status].iconClass)}>
        <Loader2 size={16} className="tx-status__spinner" />
      </span>
    );
  }
  
  if (status === 'success') {
    return (
      <span className={clsx('tx-status__icon', STATUS_CONFIG[status].iconClass)}>
        <Check size={14} strokeWidth={3} />
      </span>
    );
  }
  
  return (
    <span className={clsx('tx-status__icon', STATUS_CONFIG[status].iconClass)}>
      <X size={14} strokeWidth={3} />
    </span>
  );
}

export const TransactionStatus = memo(forwardRef<HTMLDivElement, TransactionStatusProps>(
  function TransactionStatus(
    { txId, status, title, description, onViewExplorer, onClose, className },
    ref
  ) {
    const { getExplorerTxUrl } = useBlockchain();

    const handleViewExplorer = useCallback(() => {
      if (txId) {
        window.open(getExplorerTxUrl(txId), '_blank');
      }
      onViewExplorer?.();
    }, [txId, getExplorerTxUrl, onViewExplorer]);

    const handleClose = useCallback(() => {
      onClose?.();
    }, [onClose]);

    return (
      <div
        ref={ref}
        className={clsx('tx-status', `tx-status--${status}`, className)}
        role="status"
        aria-live="polite"
      >
        <div className="tx-status__header">
          {getStatusIcon(status)}
          <div className="tx-status__info">
            <span className="tx-status__title">{title}</span>
            <span className="tx-status__label">{STATUS_CONFIG[status].label}</span>
          </div>
          {onClose && (
            <button
              type="button"
              className="tx-status__close"
              onClick={handleClose}
              aria-label="Dismiss notification"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {description && (
          <p className="tx-status__description">{description}</p>
        )}

        {txId && (
          <div className="tx-status__actions">
            <button
              type="button"
              className="tx-status__explorer-btn"
              onClick={handleViewExplorer}
            >
              View on Explorer
              <ExternalLink size={14} />
            </button>
          </div>
        )}
      </div>
    );
  }
));

// Inline transaction toast
export const TransactionToast = memo<TransactionToastProps>(
  function TransactionToast({ txId, status, message, className }) {
    const { getExplorerTxUrl } = useBlockchain();

    return (
      <div
        className={clsx('tx-toast', `tx-toast--${status}`, className)}
        role="status"
        aria-live="polite"
      >
        {getStatusIcon(status)}
        <span className="tx-toast__message">{message}</span>
        {txId && status !== 'pending' && (
          <a
            href={getExplorerTxUrl(txId)}
            target="_blank"
            rel="noopener noreferrer"
            className="tx-toast__link"
          >
            View
            <ExternalLink size={12} />
          </a>
        )}
      </div>
    );
  }
);

export default TransactionStatus;
