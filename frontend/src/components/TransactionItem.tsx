import './TransactionItem.css';

interface TransactionItemProps {
  type: 'deposit' | 'payout' | 'refund' | 'fee';
  amount: number;
  timestamp: string;
  status: 'pending' | 'confirmed' | 'failed';
  txId?: string;
  circleName?: string;
}

function TransactionItem({
  type,
  amount,
  timestamp,
  status,
  txId,
  circleName,
}: TransactionItemProps) {
  const typeConfig = {
    deposit: { label: 'Contribution', icon: '↗', color: 'outgoing' },
    payout: { label: 'Payout Received', icon: '↙', color: 'incoming' },
    refund: { label: 'Refund', icon: '↩', color: 'incoming' },
    fee: { label: 'Fee', icon: '💰', color: 'outgoing' },
  };

  const statusConfig = {
    pending: { label: 'Pending', className: 'status-pending' },
    confirmed: { label: 'Confirmed', className: 'status-confirmed' },
    failed: { label: 'Failed', className: 'status-failed' },
  };

  const config = typeConfig[type];
  const statusInfo = statusConfig[status];

  const formatAmount = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 6,
    }).format(num);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const explorerUrl = txId
    ? `https://explorer.stacks.co/txid/${txId}`
    : undefined;

  return (
    <div className="transaction-item">
      <div className={`transaction-icon ${config.color}`}>
        {config.icon}
      </div>
      <div className="transaction-details">
        <div className="transaction-main">
          <span className="transaction-type">{config.label}</span>
          {circleName && (
            <span className="transaction-circle">{circleName}</span>
          )}
        </div>
        <span className="transaction-time">{formatDate(timestamp)}</span>
      </div>
      <div className="transaction-right">
        <span className={`transaction-amount ${config.color}`}>
          {config.color === 'incoming' ? '+' : '-'}
          {formatAmount(amount)} STX
        </span>
        <span className={`transaction-status ${statusInfo.className}`}>
          {statusInfo.label}
        </span>
      </div>
      {explorerUrl && (
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="transaction-link"
          title="View on Explorer"
        >
          ↗
        </a>
      )}
    </div>
  );
}

export default TransactionItem;
