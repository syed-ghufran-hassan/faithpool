// Dashboard Summary Component

import { formatSTX } from '../utils/helpers';
import { StatsCard } from './StatsCard';
import { ReputationBadge } from './ReputationBadge';
import './DashboardSummary.css';

interface DashboardSummaryProps {
  balance: number;
  totalDeposited: number;
  totalReceived: number;
  activeCircles: number;
  completedCircles: number;
  reputation: number;
  nftCount: number;
  pendingPayouts: number;
}

export function DashboardSummary({
  balance,
  totalDeposited,
  totalReceived,
  activeCircles,
  completedCircles,
  reputation,
  nftCount,
  pendingPayouts,
}: DashboardSummaryProps) {
  const netPosition = totalReceived - totalDeposited;
  const isPositive = netPosition >= 0;

  return (
    <div className="dashboard-summary">
      <div className="summary-header">
        <div className="balance-section">
          <span className="balance-label">Wallet Balance</span>
          <span className="balance-value">{formatSTX(balance, 2)}</span>
        </div>
        <ReputationBadge score={reputation} size="lg" />
      </div>

      <div className="summary-grid">
        <StatsCard
          label="Active Circles"
          value={activeCircles}
          icon="🔄"
          variant="primary"
        />
        
        <StatsCard
          label="Completed"
          value={completedCircles}
          icon="✅"
          variant="success"
        />

        <StatsCard
          label="Total Deposited"
          value={formatSTX(totalDeposited, 2)}
          icon="📤"
          variant="default"
        />

        <StatsCard
          label="Total Received"
          value={formatSTX(totalReceived, 2)}
          icon="📥"
          variant="success"
        />

        <StatsCard
          label="Net Position"
          value={`${isPositive ? '+' : ''}${formatSTX(netPosition, 2)}`}
          icon={isPositive ? '📈' : '📉'}
          variant={isPositive ? 'success' : 'warning'}
        />

        <StatsCard
          label="NFTs Owned"
          value={nftCount}
          icon="🖼️"
          variant="default"
        />
      </div>

      {pendingPayouts > 0 && (
        <div className="pending-payouts-alert">
          <span className="alert-icon">💰</span>
          <span className="alert-text">
            You have <strong>{pendingPayouts}</strong> pending payout{pendingPayouts > 1 ? 's' : ''} to claim!
          </span>
          <span className="alert-arrow">→</span>
        </div>
      )}
    </div>
  );
}

export default DashboardSummary;
