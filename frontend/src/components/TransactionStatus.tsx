// TransactionStatus component - Display transaction progress

import { useBlockchain } from '../hooks/useBlockchain';
import { Spinner } from './Spinner';
import './TransactionStatus.css';

type TxStatus = 'pending' | 'submitted' | 'success' | 'failed';

interface TransactionStatusProps {
  txId?: string;
  status: TxStatus;
  title: string;
  description?: string;
  onViewExplorer?: () => void;
  onClose?: () => void;
}

function getStatusIcon(status: TxStatus): React.ReactNode {
  switch (status) {
    case 'pending':
      return <Spinner size="sm" />;
    case 'submitted':
      return <Spinner size="sm" />;
    case 'success':
      return <span className="status-icon success">✓</span>;
    case 'failed':
      return <span className="status-icon error">✕</span>;
  }
}

function getStatusLabel(status: TxStatus): string {
  switch (status) {
    case 'pending':
      return 'Preparing...';
    case 'submitted':
      return 'Processing...';
    case 'success':
      return 'Confirmed';
    case 'failed':
      return 'Failed';
  }
}

export function TransactionStatus({
  txId,
  status,
  title,
  description,
  onViewExplorer,
  onClose,
}: TransactionStatusProps) {
  const { getExplorerTxUrl } = useBlockchain();

  const handleViewExplorer = () => {
    if (txId) {
      window.open(getExplorerTxUrl(txId), '_blank');
    }
    onViewExplorer?.();
  };

  return (
    <div className={`transaction-status status-${status}`}>
      <div className="tx-status-header">
        {getStatusIcon(status)}
        <div className="tx-status-info">
          <span className="tx-status-title">{title}</span>
          <span className="tx-status-label">{getStatusLabel(status)}</span>
        </div>
        {onClose && (
          <button className="tx-close-btn" onClick={onClose}>
            ×
          </button>
        )}
      </div>

      {description && (
        <p className="tx-status-description">{description}</p>
      )}

      {txId && (
        <div className="tx-status-actions">
          <button 
            className="tx-explorer-btn"
            onClick={handleViewExplorer}
          >
            View on Explorer →
          </button>
        </div>
      )}
    </div>
  );
}

// Inline transaction toast
export function TransactionToast({
  txId,
  status,
  message,
}: {
  txId?: string;
  status: TxStatus;
  message: string;
}) {
  const { getExplorerTxUrl } = useBlockchain();

  return (
    <div className={`tx-toast status-${status}`}>
      {getStatusIcon(status)}
      <span className="tx-toast-message">{message}</span>
      {txId && status !== 'pending' && (
        <a 
          href={getExplorerTxUrl(txId)}
          target="_blank"
          rel="noopener noreferrer"
          className="tx-toast-link"
        >
          View
        </a>
      )}
    </div>
  );
}

export default TransactionStatus;
