// Circle Details Header Component

import { memo, forwardRef } from 'react';
import { Coins, Landmark, Clock, Timer, Users, TrendingUp } from 'lucide-react';
import clsx from 'clsx';
import { truncateAddress, formatSTX, blocksToTime } from '../utils/helpers';
import { Badge } from './Badge';
import { ProgressBar } from './ProgressBar';
import { Avatar } from './Avatar';
import './CircleDetailsHeader.css';

export type CircleStatus = 'pending' | 'active' | 'completed' | 'cancelled';

export interface CircleDetailsHeaderProps {
  name: string;
  creator: string;
  contribution: number;
  currentMembers: number;
  maxMembers: number;
  currentRound: number;
  status: CircleStatus;
  payoutInterval: number;
  nextPayoutBlock?: number;
  currentBlock?: number;
  escrowBalance: number;
  tradingEnabled?: boolean;
  className?: string;
}

const STATUS_CONFIG: Record<CircleStatus, { label: string; variant: 'warning' | 'success' | 'default' | 'error' }> = {
  pending: { label: 'Forming', variant: 'warning' },
  active: { label: 'Active', variant: 'success' },
  completed: { label: 'Completed', variant: 'default' },
  cancelled: { label: 'Cancelled', variant: 'error' },
};

export const CircleDetailsHeader = memo(forwardRef<HTMLDivElement, CircleDetailsHeaderProps>(
  function CircleDetailsHeader(
    {
      name,
      creator,
      contribution,
      currentMembers,
      maxMembers,
      currentRound,
      status,
      payoutInterval,
      nextPayoutBlock,
      currentBlock,
      escrowBalance,
      tradingEnabled = false,
      className,
    },
    ref
  ) {
    const statusConfig = STATUS_CONFIG[status];
    const memberProgress = (currentMembers / maxMembers) * 100;
    const roundProgress = (currentRound / maxMembers) * 100;

    const blocksUntilPayout =
      nextPayoutBlock && currentBlock
        ? Math.max(0, nextPayoutBlock - currentBlock)
        : null;

    return (
      <div ref={ref} className={clsx('circle-header', className)}>
        <div className="circle-header__main">
          <div className="circle-header__title-row">
            <h1 className="circle-header__name">{name}</h1>
            <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
            {tradingEnabled && <Badge variant="info">Trading</Badge>}
          </div>

          <div className="circle-header__creator">
            <Avatar address={creator} size="sm" />
            <span className="circle-header__creator-label">Created by</span>
            <span className="circle-header__creator-address">{truncateAddress(creator)}</span>
          </div>
        </div>

        <div className="circle-header__stats">
          <div className="circle-header__stat">
            <span className="circle-header__stat-icon">
              <Coins size={24} />
            </span>
            <div className="circle-header__stat-content">
              <span className="circle-header__stat-value">{formatSTX(contribution, 2)}</span>
              <span className="circle-header__stat-label">Contribution</span>
            </div>
          </div>

          <div className="circle-header__stat">
            <span className="circle-header__stat-icon">
              <Landmark size={24} />
            </span>
            <div className="circle-header__stat-content">
              <span className="circle-header__stat-value">{formatSTX(escrowBalance, 2)}</span>
              <span className="circle-header__stat-label">In Escrow</span>
            </div>
          </div>

          <div className="circle-header__stat">
            <span className="circle-header__stat-icon">
              <Clock size={24} />
            </span>
            <div className="circle-header__stat-content">
              <span className="circle-header__stat-value">{blocksToTime(payoutInterval)}</span>
              <span className="circle-header__stat-label">Payout Interval</span>
            </div>
          </div>

          {blocksUntilPayout !== null && status === 'active' && (
            <div className="circle-header__stat circle-header__stat--highlight">
              <span className="circle-header__stat-icon">
                <Timer size={24} />
              </span>
              <div className="circle-header__stat-content">
                <span className="circle-header__stat-value">{blocksToTime(blocksUntilPayout)}</span>
                <span className="circle-header__stat-label">Next Payout</span>
              </div>
            </div>
          )}
        </div>

        <div className="circle-header__progress">
          <div className="circle-header__progress-section">
            <div className="circle-header__progress-header">
              <span className="circle-header__progress-label">
                <Users size={14} />
                Members
              </span>
              <span className="circle-header__progress-value">
                {currentMembers} / {maxMembers}
              </span>
            </div>
            <ProgressBar value={memberProgress} variant="primary" />
          </div>

          {status === 'active' && (
            <div className="circle-header__progress-section">
              <div className="circle-header__progress-header">
                <span className="circle-header__progress-label">
                  <TrendingUp size={14} />
                  Round Progress
                </span>
                <span className="circle-header__progress-value">
                  {currentRound} / {maxMembers}
                </span>
              </div>
              <ProgressBar value={roundProgress} variant="success" />
            </div>
          )}
        </div>
      </div>
    );
  }
));

export default CircleDetailsHeader;
