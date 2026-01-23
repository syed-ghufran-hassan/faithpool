import React, { useState, useMemo, forwardRef, useCallback } from 'react';
import {
  Search,
  ArrowUpCircle,
  ArrowDownCircle,
  DollarSign,
  Clock,
  Image,
  Users,
  CreditCard,
  ExternalLink,
  ChevronDown,
  type LucideIcon,
} from 'lucide-react';
import clsx from 'clsx';
import { Card } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import { Skeleton } from './Skeleton';
import { EmptyState } from './EmptyState';
import './TransactionHistory.css';

export type TransactionType = 'deposit' | 'withdrawal' | 'payout' | 'contribution' | 'nft_mint' | 'nft_sale' | 'referral';
export type TransactionStatus = 'pending' | 'confirmed' | 'failed';

export interface Transaction {
  id: string;
  txId: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  timestamp: Date;
  circleId?: number;
  circleName?: string;
  counterparty?: string;
  fee?: number;
  blockHeight?: number;
}

export interface TransactionHistoryProps {
  transactions: Transaction[];
  isLoading?: boolean;
  onViewTransaction?: (txId: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  showFilters?: boolean;
  maxHeight?: string | number;
  className?: string;
}

type SortOption = 'newest' | 'oldest' | 'amount_high' | 'amount_low';
type FilterType = 'all' | 'deposit' | 'withdrawal' | 'payout' | 'contribution' | 'nft';

interface TypeConfig {
  label: string;
  icon: LucideIcon;
  color: 'success' | 'error' | 'warning' | 'info' | 'default';
  isIncoming: boolean;
}

const TYPE_CONFIGS: Record<TransactionType, TypeConfig> = {
  deposit: {
    label: 'Deposit',
    icon: ArrowUpCircle,
    color: 'success',
    isIncoming: true,
  },
  withdrawal: {
    label: 'Withdrawal',
    icon: ArrowDownCircle,
    color: 'error',
    isIncoming: false,
  },
  payout: {
    label: 'Payout',
    icon: DollarSign,
    color: 'success',
    isIncoming: true,
  },
  contribution: {
    label: 'Contribution',
    icon: Clock,
    color: 'warning',
    isIncoming: false,
  },
  nft_mint: {
    label: 'NFT Mint',
    icon: Image,
    color: 'info',
    isIncoming: true,
  },
  nft_sale: {
    label: 'NFT Sale',
    icon: Image,
    color: 'success',
    isIncoming: true,
  },
  referral: {
    label: 'Referral',
    icon: Users,
    color: 'default',
    isIncoming: true,
  },
};

const STATUS_VARIANTS: Record<TransactionStatus, 'success' | 'warning' | 'error'> = {
  confirmed: 'success',
  pending: 'warning',
  failed: 'error',
};

export const TransactionHistory = forwardRef<HTMLDivElement, TransactionHistoryProps>(
  function TransactionHistory(
    {
      transactions,
      isLoading = false,
      onViewTransaction,
      onLoadMore,
      hasMore = false,
      showFilters = true,
      maxHeight = 500,
      className,
    },
    ref
  ) {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<SortOption>('newest');
    const [filterType, setFilterType] = useState<FilterType>('all');

    const formatSTX = useCallback((microStx: number): string => {
      const stx = microStx / 1_000_000;
      if (stx >= 1000000) return `${(stx / 1000000).toFixed(2)}M`;
      if (stx >= 1000) return `${(stx / 1000).toFixed(2)}K`;
      return stx.toFixed(2);
    }, []);

    const formatDate = useCallback((date: Date): string => {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }, []);

    const truncateTxId = useCallback((txId: string): string => {
      if (txId.length <= 16) return txId;
      return `${txId.slice(0, 8)}...${txId.slice(-6)}`;
    }, []);

    const filteredTransactions = useMemo(() => {
      let result = [...transactions];

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        result = result.filter(
          tx =>
            tx.txId.toLowerCase().includes(query) ||
            tx.circleName?.toLowerCase().includes(query) ||
            tx.counterparty?.toLowerCase().includes(query)
        );
      }

      if (filterType !== 'all') {
        if (filterType === 'nft') {
          result = result.filter(tx => tx.type === 'nft_mint' || tx.type === 'nft_sale');
        } else {
          result = result.filter(tx => tx.type === filterType);
        }
      }

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

    const groupedTransactions = useMemo(() => {
      const groups: Record<string, Transaction[]> = {};

      filteredTransactions.forEach(tx => {
        const dateKey = tx.timestamp.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        });
        if (!groups[dateKey]) groups[dateKey] = [];
        groups[dateKey].push(tx);
      });

      return groups;
    }, [filteredTransactions]);

    const handleViewTx = useCallback((txId: string) => {
      if (onViewTransaction) {
        onViewTransaction(txId);
      } else {
        window.open(`https://explorer.hiro.so/txid/${txId}?chain=mainnet`, '_blank');
      }
    }, [onViewTransaction]);

    if (isLoading && transactions.length === 0) {
      return (
        <Card ref={ref} className={clsx('tx-history', className)}>
          <div className="tx-history__header">
            <Skeleton width={150} height={24} />
          </div>
          {showFilters && (
            <div className="tx-history__filters">
              <Skeleton width={200} height={40} />
              <Skeleton width={150} height={40} />
            </div>
          )}
          <div className="tx-history__list">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="tx-history__skeleton-item">
                <Skeleton variant="circular" width={40} height={40} />
                <div className="tx-history__skeleton-content">
                  <Skeleton width="60%" height={16} />
                  <Skeleton width="40%" height={12} />
                </div>
                <Skeleton width={80} height={20} />
              </div>
            ))}
          </div>
        </Card>
      );
    }

    return (
      <Card ref={ref} className={clsx('tx-history', className)}>
        <div className="tx-history__header">
          <h3 className="tx-history__title">Transaction History</h3>
          <Badge variant="default" size="sm">
            {filteredTransactions.length} total
          </Badge>
        </div>

        {showFilters && (
          <div className="tx-history__filters">
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search size={16} />}
              size="sm"
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
              size="sm"
            />
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              options={[
                { value: 'newest', label: 'Newest' },
                { value: 'oldest', label: 'Oldest' },
                { value: 'amount_high', label: 'Highest' },
                { value: 'amount_low', label: 'Lowest' },
              ]}
              size="sm"
            />
          </div>
        )}

        {filteredTransactions.length === 0 ? (
          <EmptyState
            preset="no-results"
            icon={CreditCard}
            title="No Transactions"
            description="No transactions match your filters"
            size="sm"
          />
        ) : (
          <div 
            className="tx-history__content"
            style={{ maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight }}
          >
            {Object.entries(groupedTransactions).map(([date, txs]) => (
              <div key={date} className="tx-history__group">
                <div className="tx-history__date">{date}</div>
                <div className="tx-history__items">
                  {txs.map((tx) => {
                    const config = TYPE_CONFIGS[tx.type];
                    const IconComponent = config.icon;

                    return (
                      <div
                        key={tx.id}
                        className="tx-history__item"
                        onClick={() => handleViewTx(tx.txId)}
                        role="button"
                        tabIndex={0}
                      >
                        <div className={clsx('tx-history__icon', `tx-history__icon--${config.color}`)}>
                          <IconComponent size={18} />
                        </div>

                        <div className="tx-history__details">
                          <div className="tx-history__type-row">
                            <span className="tx-history__type-label">{config.label}</span>
                            <Badge variant={STATUS_VARIANTS[tx.status]} size="sm">
                              {tx.status}
                            </Badge>
                          </div>
                          <div className="tx-history__meta">
                            <span className="tx-history__txid">{truncateTxId(tx.txId)}</span>
                            {tx.circleName && (
                              <>
                                <span className="tx-history__separator">•</span>
                                <span className="tx-history__circle">{tx.circleName}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className={clsx(
                          'tx-history__amount',
                          config.isIncoming ? 'tx-history__amount--incoming' : 'tx-history__amount--outgoing'
                        )}>
                          {config.isIncoming ? '+' : '-'}{formatSTX(tx.amount)} STX
                        </div>

                        <ExternalLink size={14} className="tx-history__link-icon" />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {hasMore && (
              <div className="tx-history__load-more">
                <Button
                  variant="ghost"
                  onClick={onLoadMore}
                  isLoading={isLoading}
                  size="sm"
                >
                  <ChevronDown size={16} />
                  Load More
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
    );
  }
);

export default TransactionHistory;
