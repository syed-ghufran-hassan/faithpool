import React, { useState, useMemo } from 'react';
import { Card } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import { ProgressBar } from './ProgressBar';
import { Skeleton } from './Skeleton';
import { EmptyState } from './EmptyState';
import './CircleList.css';

interface Circle {
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

interface CircleListProps {
  circles: Circle[];
  isLoading?: boolean;
  onJoinCircle?: (circleId: number) => void;
  onViewCircle?: (circleId: number) => void;
  showFilters?: boolean;
  emptyMessage?: string;
  className?: string;
}

type SortOption = 'newest' | 'oldest' | 'members' | 'contribution' | 'payout';
type FilterStatus = 'all' | 'active' | 'pending' | 'completed';

export const CircleList: React.FC<CircleListProps> = ({
  circles,
  isLoading = false,
  onJoinCircle,
  onViewCircle,
  showFilters = true,
  emptyMessage = 'No circles found',
  className = '',
}) => {
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
      <div className={`circle-list ${className}`}>
        {showFilters && (
          <div className="circle-list__filters">
            <Skeleton width="200px" height="40px" />
            <Skeleton width="150px" height="40px" />
            <Skeleton width="150px" height="40px" />
          </div>
        )}
        <div className="circle-list__grid">
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
    <div className={`circle-list ${className}`}>
      {showFilters && (
        <div className="circle-list__filters">
          <div className="circle-list__search">
            <Input
              placeholder="Search circles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              }
            />
          </div>

          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            options={[
              { value: 'newest', label: 'Newest First' },
              { value: 'oldest', label: 'Oldest First' },
              { value: 'members', label: 'Most Members' },
              { value: 'contribution', label: 'Highest Contribution' },
              { value: 'payout', label: 'Largest Pool' },
            ]}
          />

          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'pending', label: 'Pending' },
              { value: 'completed', label: 'Completed' },
            ]}
          />

          <label className="circle-list__checkbox">
            <input
              type="checkbox"
              checked={showJoinedOnly}
              onChange={(e) => setShowJoinedOnly(e.target.checked)}
            />
            <span>My Circles</span>
          </label>
        </div>
      )}

      {filteredCircles.length === 0 ? (
        <EmptyState
          title="No Circles Found"
          description={emptyMessage}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          }
        />
      ) : (
        <>
          <div className="circle-list__count">
            Showing {filteredCircles.length} of {circles.length} circles
          </div>

          <div className="circle-list__grid">
            {filteredCircles.map(circle => (
              <Card
                key={circle.id}
                className={`circle-list__item ${circle.isJoined ? 'circle-list__item--joined' : ''}`}
                hoverable
                onClick={() => onViewCircle?.(circle.id)}
              >
                <div className="circle-list__item-header">
                  <div className="circle-list__item-title">
                    <h3>{circle.name}</h3>
                    {getStatusBadge(circle.status)}
                  </div>
                  <span className="circle-list__item-creator">
                    by {truncateAddress(circle.creator)}
                  </span>
                </div>

                <div className="circle-list__item-stats">
                  <div className="circle-list__stat">
                    <span className="circle-list__stat-label">Members</span>
                    <span className="circle-list__stat-value">
                      {circle.currentMembers}/{circle.maxMembers}
                    </span>
                  </div>
                  <div className="circle-list__stat">
                    <span className="circle-list__stat-label">Contribution</span>
                    <span className="circle-list__stat-value">
                      {formatSTX(circle.contributionAmount)} STX
                    </span>
                  </div>
                  <div className="circle-list__stat">
                    <span className="circle-list__stat-label">Frequency</span>
                    <span className="circle-list__stat-value">{circle.payoutFrequency}</span>
                  </div>
                </div>

                <div className="circle-list__item-progress">
                  <ProgressBar
                    value={(circle.currentMembers / circle.maxMembers) * 100}
                    size="small"
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
                        size="small"
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
                      size="small"
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
};

export default CircleList;
