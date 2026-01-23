import { memo, forwardRef, useMemo } from 'react';
import { ArrowUpRight, ArrowDownLeft, RotateCcw, Coins, ExternalLink } from 'lucide-react';
import clsx from 'clsx';
import './TransactionItem.css';

export type TransactionType = 'deposit' | 'payout' | 'refund' | 'fee';
export type TransactionStatus = 'pending' | 'confirmed' | 'failed';

export interface TransactionItemProps {
  type: TransactionType;
  amount: number;
  timestamp: string;
  status: TransactionStatus;
  txId?: string;
  circleName?: string;
  className?: string;
}

const TYPE_CONFIG = {
  deposit: { label: 'Contribution', Icon: ArrowUpRight, color: 'outgoing' },
  payout: { label: 'Payout Received', Icon: ArrowDownLeft, color: 'incoming' },
  refund: { label: 'Refund', Icon: RotateCcw, color: 'incoming' },
  fee: { label: 'Fee', Icon: Coins, color: 'outgoing' },
} as const;

const STATUS_CONFIG = {
  pending: { label: 'Pending', className: 'tx-item__status--pending' },
  confirmed: { label: 'Confirmed', className: 'tx-item__status--confirmed' },
  failed: { label: 'Failed', className: 'tx-item__status--failed' },
} as const;

function formatAmount(num: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  }).format(num);
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const TransactionItem = memo(forwardRef<HTMLDivElement, TransactionItemProps>(
  function TransactionItem(
    { type, amount, timestamp, status, txId, circleName, className },
    ref
  ) {
    const config = TYPE_CONFIG[type];
    const statusInfo = STATUS_CONFIG[status];
    const Icon = config.Icon;

    const explorerUrl = useMemo(
      () => (txId ? `https://explorer.stacks.co/txid/${txId}` : undefined),
      [txId]
    );

    return (
      <div ref={ref} className={clsx('tx-item', className)}>
        <div className={clsx('tx-item__icon', `tx-item__icon--${config.color}`)}>
          <Icon size={18} />
        </div>
        
        <div className="tx-item__details">
          <div className="tx-item__main">
            <span className="tx-item__type">{config.label}</span>
            {circleName && (
              <span className="tx-item__circle">{circleName}</span>
            )}
          </div>
          <span className="tx-item__time">{formatDate(timestamp)}</span>
        </div>
        
        <div className="tx-item__right">
          <span className={clsx('tx-item__amount', `tx-item__amount--${config.color}`)}>
            {config.color === 'incoming' ? '+' : '-'}
            {formatAmount(amount)} STX
          </span>
          <span className={clsx('tx-item__status', statusInfo.className)}>
            {statusInfo.label}
          </span>
        </div>
        
        {explorerUrl && (
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="tx-item__link"
            title="View on Explorer"
            aria-label="View transaction on explorer"
          >
            <ExternalLink size={16} />
          </a>
        )}
      </div>
    );
  }
));

export default TransactionItem;
