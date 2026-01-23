import { forwardRef, useState, useMemo, useCallback, memo } from 'react';
import type { HTMLAttributes } from 'react';
import { 
  Search, 
  Clock, 
  Users, 
  Coins, 
  Calendar,
  Eye,
  UserPlus
} from 'lucide-react';
import clsx from 'clsx';
import { Card } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import { ProgressBar } from './ProgressBar';
import { Skeleton } from './Skeleton';
import { EmptyState } from './EmptyState';
import './CircleList.css';

export interface Circle {
  id: number;
  name: string;
  creator: string;
  maxMembers: number;
  currentMembers: number;
  contributionAmount: number;
  payoutFrequency: string;
  status: 'active' | 'pending' | 'completed' | 'cancelled';
  nextPayout?: Date;
  totalPooled: number;
  isJoined?: boolean;
  position?: number;
}

export type SortOption = 'newest' | 'oldest' | 'members' | 'contribution' | 'payout';
export type FilterStatus = 'all' | 'active' | 'pending' | 'completed';

export interface CircleListProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** List of circles to display */
  circles: Circle[];
  /** Loading state */
  isLoading?: boolean;
  /** Join circle handler */
  onJoinCircle?: (circleId: number) => void;
  /** View circle handler */
  onViewCircle?: (circleId: number) => void;
  /** Show filter controls */
  showFilters?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Grid columns on desktop */
  columns?: 2 | 3 | 4;
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'members', label: 'Most Members' },
  { value: 'contribution', label: 'Highest Contribution' },
  { value: 'payout', label: 'Largest Pool' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
];

const STATUS_VARIANTS: Record<Circle['status'], 'success' | 'warning' | 'info' | 'secondary'> = {
  active: 'success',
  pending: 'warning',
  completed: 'info',
  cancelled: 'secondary',
};

const formatSTX = (microStx: number): string => {
  return (microStx / 1_000_000).toFixed(2);
};

const formatDate = (date: Date): string => {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return 'Soon';
  }
};

const truncateAddress = (address: string): string => {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const CircleList = memo(forwardRef<HTMLDivElement, CircleListProps>(
  function CircleList(
    {
      circles,
      isLoading = false,
      onJoinCircle,
      onViewCircle,
      showFilters = true,
      emptyMessage = 'No circles found',
      columns = 3,
      className,
      ...props
    },
    ref
  ) {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<SortOption>('newest');
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
    const [showJoinedOnly, setShowJoinedOnly] = useState(false);

    const filteredCircles = useMemo(() => {
      let result = [...circles];

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        result = result.filter(
          circle =>
            circle.name.toLowerCase().includes(query) ||
            circle.creator.toLowerCase().includes(query)
        );
      }

      // Filter by status
      if (filterStatus !== 'all') {
        result = result.filter(circle => circle.status === filterStatus);
      }

      // Filter by joined
      if (showJoinedOnly) {
        result = result.filter(circle => circle.isJoined);
      }

      // Sort
      switch (sortBy) {
        case 'newest':
          result.sort((a, b) => b.id - a.id);
          break;
        case 'oldest':
          result.sort((a, b) => a.id - b.id);
          break;
        case 'members':
          result.sort((a, b) => b.currentMembers - a.currentMembers);
          break;
        case 'contribution':
          result.sort((a, b) => b.contributionAmount - a.contributionAmount);
          break;
        case 'payout':
          result.sort((a, b) => b.totalPooled - a.totalPooled);
          break;
      }

      return result;
    }, [circles, searchQuery, sortBy, filterStatus, showJoinedOnly]);

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    }, []);

    const handleSortChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
      setSortBy(e.target.value as SortOption);
    }, []);

    const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
      setFilterStatus(e.target.value as FilterStatus);
    }, []);

    const handleJoinedToggle = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      setShowJoinedOnly(e.target.checked);
    }, []);
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return 'Soon';
    }
  };

  const getStatusBadge = (status: Circle['status']) => {
    const variants: Record<Circle['status'], 'success' | 'warning' | 'info' | 'secondary'> = {
      active: 'success',
      pending: 'warning',
      completed: 'info',
      cancelled: 'secondary',
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const truncateAddress = (address: string): string => {
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

    if (isLoading) {
      return (
        <div ref={ref} className={clsx('circle-list', className)} {...props}>
          {showFilters && (
            <div className="circle-list__filters">
              <Skeleton width="200px" height="40px" />
              <Skeleton width="150px" height="40px" />
              <Skeleton width="150px" height="40px" />
            </div>
          )}
          <div className={clsx('circle-list__grid', `circle-list__grid--cols-${columns}`)}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="circle-list__item-skeleton">
                <Skeleton height="24px" width="60%" />
                <Skeleton height="16px" width="40%" />
                <Skeleton height="40px" />
                <Skeleton height="32px" />
              </Card>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div ref={ref} className={clsx('circle-list', className)} {...props}>
        {showFilters && (
          <div className="circle-list__filters">
            <div className="circle-list__search">
              <Input
                placeholder="Search circles..."
                value={searchQuery}
                onChange={handleSearchChange}
                leftIcon={<Search size={18} />}
              />
            </div>

            <Select
              value={sortBy}
              onChange={handleSortChange}
              options={SORT_OPTIONS}
            />

            <Select
              value={filterStatus}
              onChange={handleFilterChange}
              options={STATUS_OPTIONS}
            />

            <label className="circle-list__checkbox">
              <input
                type="checkbox"
                checked={showJoinedOnly}
                onChange={handleJoinedToggle}
              />
              <span>My Circles</span>
            </label>
          </div>
        )}

        {filteredCircles.length === 0 ? (
          <EmptyState
            title="No Circles Found"
            description={emptyMessage}
            icon={<Clock size={48} />}
          />
        ) : (
          <>
            <div className="circle-list__count">
              Showing {filteredCircles.length} of {circles.length} circles
            </div>

            <div className={clsx('circle-list__grid', `circle-list__grid--cols-${columns}`)}>
              {filteredCircles.map(circle => (
                <Card
                  key={circle.id}
                  className={clsx(
                    'circle-list__item',
                    circle.isJoined && 'circle-list__item--joined'
                  )}
                  hoverable
                  onClick={() => onViewCircle?.(circle.id)}
                >
                  <div className="circle-list__item-header">
                    <div className="circle-list__item-title">
                      <h3>{circle.name}</h3>
                      <Badge variant={STATUS_VARIANTS[circle.status]}>{circle.status}</Badge>
                    </div>
                    <span className="circle-list__item-creator">
                      by {truncateAddress(circle.creator)}
                    </span>
                  </div>

                  <div className="circle-list__item-stats">
                    <div className="circle-list__stat">
                      <Users className="circle-list__stat-icon" size={14} />
                      <span className="circle-list__stat-label">Members</span>
                      <span className="circle-list__stat-value">
                        {circle.currentMembers}/{circle.maxMembers}
                      </span>
                    </div>
                    <div className="circle-list__stat">
                      <Coins className="circle-list__stat-icon" size={14} />
                      <span className="circle-list__stat-label">Contribution</span>
                      <span className="circle-list__stat-value">
                        {formatSTX(circle.contributionAmount)} STX
                      </span>
                    </div>
                    <div className="circle-list__stat">
                      <Calendar className="circle-list__stat-icon" size={14} />
                      <span className="circle-list__stat-label">Frequency</span>
                      <span className="circle-list__stat-value">{circle.payoutFrequency}</span>
                    </div>
                  </div>

                  <div className="circle-list__item-progress">
                    <ProgressBar
                      value={(circle.currentMembers / circle.maxMembers) * 100}
                      size="sm"
                      showLabel={false}
                    />
                  </div>

                  <div className="circle-list__item-footer">
                    <div className="circle-list__item-pool">
                      <span className="circle-list__pool-label">Total Pool</span>
                      <span className="circle-list__pool-value">
                        {formatSTX(circle.totalPooled)} STX
                      </span>
                    </div>

                    {circle.nextPayout && circle.status === 'active' && (
                      <div className="circle-list__item-countdown">
                        <Clock className="circle-list__countdown-icon" size={14} />
                        <span className="circle-list__countdown-label">Next Payout</span>
                        <span className="circle-list__countdown-value">
                          {formatDate(circle.nextPayout)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="circle-list__item-actions">
                    {circle.isJoined ? (
                      <>
                        {circle.position && (
                          <Badge variant="info">Position #{circle.position}</Badge>
                        )}
                        <Button
                          variant="secondary"
                          size="sm"
                          leftIcon={<Eye size={14} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewCircle?.(circle.id);
                          }}
                        >
                          View Details
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<UserPlus size={14} />}
                        disabled={circle.status !== 'active' || circle.currentMembers >= circle.maxMembers}
                        onClick={(e) => {
                          e.stopPropagation();
                          onJoinCircle?.(circle.id);
                        }}
                      >
                        {circle.currentMembers >= circle.maxMembers ? 'Full' : 'Join Circle'}
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }
));

export { CircleList as default };
