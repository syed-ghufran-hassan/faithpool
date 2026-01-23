// Circle Details Header Component

import { truncateAddress, formatSTX, blocksToTime } from '../utils/helpers';
import { Badge } from './Badge';
import { ProgressBar } from './ProgressBar';
import { Avatar } from './Avatar';
import './CircleDetailsHeader.css';

interface CircleDetailsHeaderProps {
  name: string;
  creator: string;
  contribution: number;
  currentMembers: number;
  maxMembers: number;
  currentRound: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  payoutInterval: number;
  nextPayoutBlock?: number;
  currentBlock?: number;
  escrowBalance: number;
  tradingEnabled?: boolean;
}

const STATUS_CONFIG = {
  pending: { label: 'Forming', variant: 'warning' as const },
  active: { label: 'Active', variant: 'success' as const },
  completed: { label: 'Completed', variant: 'default' as const },
  cancelled: { label: 'Cancelled', variant: 'error' as const },
};

export function CircleDetailsHeader({
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
}: CircleDetailsHeaderProps) {
  const statusConfig = STATUS_CONFIG[status];
  const memberProgress = (currentMembers / maxMembers) * 100;
  const roundProgress = (currentRound / maxMembers) * 100;
  
  const blocksUntilPayout = nextPayoutBlock && currentBlock 
    ? Math.max(0, nextPayoutBlock - currentBlock)
    : null;

  return (
    <div className="circle-details-header">
      <div className="header-main">
        <div className="header-title-row">
          <h1 className="circle-name">{name}</h1>
          <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
          {tradingEnabled && <Badge variant="info">Trading</Badge>}
        </div>

        <div className="header-creator">
          <Avatar address={creator} size="sm" />
          <span className="creator-label">Created by</span>
          <span className="creator-address">{truncateAddress(creator)}</span>
        </div>
      </div>

      <div className="header-stats">
        <div className="stat-card">
          <span className="stat-icon">💰</span>
          <div className="stat-content">
            <span className="stat-value">{formatSTX(contribution, 2)}</span>
            <span className="stat-label">Contribution</span>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">🏦</span>
          <div className="stat-content">
            <span className="stat-value">{formatSTX(escrowBalance, 2)}</span>
            <span className="stat-label">In Escrow</span>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">⏱️</span>
          <div className="stat-content">
            <span className="stat-value">{blocksToTime(payoutInterval)}</span>
            <span className="stat-label">Payout Interval</span>
          </div>
        </div>

        {blocksUntilPayout !== null && status === 'active' && (
          <div className="stat-card highlight">
            <span className="stat-icon">⏳</span>
            <div className="stat-content">
              <span className="stat-value">{blocksToTime(blocksUntilPayout)}</span>
              <span className="stat-label">Next Payout</span>
            </div>
          </div>
        )}
      </div>

      <div className="header-progress">
        <div className="progress-section">
          <div className="progress-header">
            <span className="progress-label">Members</span>
            <span className="progress-value">{currentMembers} / {maxMembers}</span>
          </div>
          <ProgressBar value={memberProgress} variant="primary" />
        </div>

        {status === 'active' && (
          <div className="progress-section">
            <div className="progress-header">
              <span className="progress-label">Round Progress</span>
              <span className="progress-value">{currentRound} / {maxMembers}</span>
            </div>
            <ProgressBar value={roundProgress} variant="success" />
          </div>
        )}
      </div>
    </div>
  );
}

export default CircleDetailsHeader;
