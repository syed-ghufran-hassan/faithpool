import React, { useState, useMemo } from 'react';
import { Card } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import { Skeleton } from './Skeleton';
import { EmptyState } from './EmptyState';
import './TransactionHistory.css';

interface Transaction {
  id: string;
  txId: string;
  type: 'deposit' | 'withdrawal' | 'payout' | 'contribution' | 'nft_mint' | 'nft_sale' | 'referral';
  amount: number;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: Date;
  circleId?: number;
  circleName?: string;
  counterparty?: string;
  fee?: number;
  blockHeight?: number;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
  isLoading?: boolean;
  onViewTransaction?: (txId: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  className?: string;
}

type SortOption = 'newest' | 'oldest' | 'amount_high' | 'amount_low';
type FilterType = 'all' | 'deposit' | 'withdrawal' | 'payout' | 'contribution' | 'nft';

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  isLoading = false,
  onViewTransaction,
  onLoadMore,
  hasMore = false,
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterType, setFilterType] = useState<FilterType>('all');

  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        tx =>
          tx.txId.toLowerCase().includes(query) ||
          tx.circleName?.toLowerCase().includes(query) ||
          tx.counterparty?.toLowerCase().includes(query)
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      if (filterType === 'nft') {
        result = result.filter(tx => tx.type === 'nft_mint' || tx.type === 'nft_sale');
      } else {
        result = result.filter(tx => tx.type === filterType);
      }
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        break;
      case 'oldest':
        result.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        break;
      case 'amount_high':
        result.sort((a, b) => b.amount - a.amount);
        break;
      case 'amount_low':
        result.sort((a, b) => a.amount - b.amount);
        break;
    }

    return result;
  }, [transactions, searchQuery, sortBy, filterType]);

  const formatSTX = (microStx: number): string => {
    const stx = microStx / 1_000_000;
    if (stx >= 1000000) {
      return `${(stx / 1000000).toFixed(2)}M`;
    } else if (stx >= 1000) {
      return `${(stx / 1000).toFixed(2)}K`;
    }
    return stx.toFixed(2);
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const truncateTxId = (txId: string): string => {
    if (txId.length <= 16) return txId;
    return `${txId.slice(0, 8)}...${txId.slice(-6)}`;
  };

  const getTypeConfig = (type: Transaction['type']) => {
    const configs: Record<Transaction['type'], { 
      label: string; 
      icon: React.ReactNode; 
      color: string;
      isIncoming: boolean;
    }> = {
      deposit: {
        label: 'Deposit',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 19V5" />
            <polyline points="5 12 12 5 19 12" />
          </svg>
        ),
        color: 'success',
        isIncoming: true,
      },
      withdrawal: {
        label: 'Withdrawal',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14" />
            <polyline points="19 12 12 19 5 12" />
          </svg>
        ),
        color: 'error',
        isIncoming: false,
      },
      payout: {
        label: 'Payout',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
          </svg>
        ),
        color: 'success',
        isIncoming: true,
      },
      contribution: {
        label: 'Contribution',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
        ),
        color: 'warning',
        isIncoming: false,
      },
      nft_mint: {
        label: 'NFT Mint',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        ),
        color: 'info',
        isIncoming: true,
      },
      nft_sale: {
        label: 'NFT Sale',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        ),
        color: 'success',
        isIncoming: true,
      },
      referral: {
        label: 'Referral',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 00-3-3.87" />
            <path d="M16 3.13a4 4 0 010 7.75" />
          </svg>
        ),
        color: 'primary',
        isIncoming: true,
      },
    };
    return configs[type];
  };

  const getStatusBadge = (status: Transaction['status']) => {
    const variants: Record<Transaction['status'], 'success' | 'warning' | 'error'> = {
      confirmed: 'success',
      pending: 'warning',
      failed: 'error',
    };
    return <Badge variant={variants[status]} size="small">{status}</Badge>;
  };

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    const groups: { [key: string]: Transaction[] } = {};
    
    filteredTransactions.forEach(tx => {
      const dateKey = tx.timestamp.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(tx);
    });
    
    return groups;
  }, [filteredTransactions]);

  if (isLoading && transactions.length === 0) {
    return (
      <Card className={`transaction-history ${className}`}>
        <div className="transaction-history__header">
          <Skeleton width="150px" height="24px" />
        </div>
        <div className="transaction-history__filters">
          <Skeleton width="200px" height="40px" />
          <Skeleton width="150px" height="40px" />
        </div>
        <div className="transaction-history__list">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} height="60px" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className={`transaction-history ${className}`}>
      <div className="transaction-history__header">
        <h3>Transaction History</h3>
        <span className="transaction-history__count">
          {filteredTransactions.length} transactions
        </span>
      </div>

      <div className="transaction-history__filters">
        <Input
          placeholder="Search by tx ID, circle, or address..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          }
        />
        <Select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as FilterType)}
          options={[
            { value: 'all', label: 'All Types' },
            { value: 'deposit', label: 'Deposits' },
            { value: 'withdrawal', label: 'Withdrawals' },
            { value: 'payout', label: 'Payouts' },
            { value: 'contribution', label: 'Contributions' },
            { value: 'nft', label: 'NFT Activity' },
          ]}
        />
        <Select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          options={[
            { value: 'newest', label: 'Newest First' },
            { value: 'oldest', label: 'Oldest First' },
            { value: 'amount_high', label: 'Highest Amount' },
            { value: 'amount_low', label: 'Lowest Amount' },
          ]}
        />
      </div>

      {filteredTransactions.length === 0 ? (
        <EmptyState
          title="No Transactions"
          description="No transactions match your filters"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
          }
        />
      ) : (
        <div className="transaction-history__content">
          {Object.entries(groupedTransactions).map(([date, txs]) => (
            <div key={date} className="transaction-history__group">
              <div className="transaction-history__date">{date}</div>
              <div className="transaction-history__items">
                {txs.map((tx) => {
                  const config = getTypeConfig(tx.type);
                  return (
                    <div
                      key={tx.id}
                      className="transaction-history__item"
                      onClick={() => onViewTransaction?.(tx.txId)}
                    >
                      <div className={`transaction-history__icon transaction-history__icon--${config.color}`}>
                        {config.icon}
                      </div>

                      <div className="transaction-history__details">
                        <div className="transaction-history__type">
                          {config.label}
                          {getStatusBadge(tx.status)}
                        </div>
                        <div className="transaction-history__meta">
                          <span className="transaction-history__txid">
                            {truncateTxId(tx.txId)}
                          </span>
                          {tx.circleName && (
                            <span className="transaction-history__circle">
                              {tx.circleName}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className={`transaction-history__amount ${config.isIncoming ? 'incoming' : 'outgoing'}`}>
                        {config.isIncoming ? '+' : '-'}{formatSTX(tx.amount)} STX
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {hasMore && (
            <div className="transaction-history__load-more">
              <Button
                variant="secondary"
                onClick={onLoadMore}
                isLoading={isLoading}
              >
                Load More
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default TransactionHistory;
