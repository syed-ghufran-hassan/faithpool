import React, { useMemo } from 'react';
import { formatSTX } from '../utils/helpers';
import './EscrowBalance.css';

interface EscrowBalanceProps {
  totalDeposited: number;
  pendingPayout: number;
  availableWithdraw: number;
  lockedAmount: number;
  className?: string;
}

export const EscrowBalance: React.FC<EscrowBalanceProps> = ({
  totalDeposited,
  pendingPayout,
  availableWithdraw,
  lockedAmount,
  className = ''
}) => {
  const percentages = useMemo(() => {
    const total = totalDeposited;
    if (total === 0) return { locked: 0, pending: 0, available: 0 };
    
    return {
      locked: (lockedAmount / total) * 100,
      pending: (pendingPayout / total) * 100,
      available: (availableWithdraw / total) * 100
    };
  }, [totalDeposited, pendingPayout, availableWithdraw, lockedAmount]);
  
  return (
    <div className={`escrow-balance ${className}`}>
      <div className="escrow-header">
        <h3 className="escrow-title">Escrow Balance</h3>
        <span className="escrow-total">{formatSTX(totalDeposited)}</span>
      </div>
      
      <div className="escrow-bar">
        <div 
          className="escrow-segment locked" 
          style={{ width: `${percentages.locked}%` }}
          title={`Locked: ${formatSTX(lockedAmount)}`}
        />
        <div 
          className="escrow-segment pending" 
          style={{ width: `${percentages.pending}%` }}
          title={`Pending: ${formatSTX(pendingPayout)}`}
        />
        <div 
          className="escrow-segment available" 
          style={{ width: `${percentages.available}%` }}
          title={`Available: ${formatSTX(availableWithdraw)}`}
        />
      </div>
      
      <div className="escrow-legend">
        <div className="legend-item">
          <span className="legend-dot locked"></span>
          <span className="legend-label">Locked</span>
          <span className="legend-value">{formatSTX(lockedAmount)}</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot pending"></span>
          <span className="legend-label">Pending Payout</span>
          <span className="legend-value">{formatSTX(pendingPayout)}</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot available"></span>
          <span className="legend-label">Available</span>
          <span className="legend-value">{formatSTX(availableWithdraw)}</span>
        </div>
      </div>
    </div>
  );
};

// Compact version for cards/sidebars
interface CompactEscrowProps {
  balance: number;
  label?: string;
  className?: string;
}

export const CompactEscrow: React.FC<CompactEscrowProps> = ({
  balance,
  label = 'In Escrow',
  className = ''
}) => (
  <div className={`compact-escrow ${className}`}>
    <span className="compact-escrow-label">{label}</span>
    <span className="compact-escrow-value">{formatSTX(balance)}</span>
  </div>
);

// Circle-specific escrow breakdown
interface CircleEscrowProps {
  circleId: number;
  yourDeposits: number;
  poolTotal: number;
  nextPayout: number;
  payoutRecipient?: string;
  className?: string;
}

export const CircleEscrow: React.FC<CircleEscrowProps> = ({
  circleId,
  yourDeposits,
  poolTotal,
  nextPayout,
  payoutRecipient,
  className = ''
}) => {
  const yourPercentage = poolTotal > 0 ? (yourDeposits / poolTotal) * 100 : 0;
  
  return (
    <div className={`circle-escrow ${className}`}>
      <div className="circle-escrow-header">
        <span className="circle-escrow-id">Circle #{circleId}</span>
        <span className="circle-escrow-pool">{formatSTX(poolTotal)}</span>
      </div>
      
      <div className="circle-escrow-details">
        <div className="escrow-detail-row">
          <span>Your Deposits</span>
          <span>{formatSTX(yourDeposits)} ({yourPercentage.toFixed(1)}%)</span>
        </div>
        <div className="escrow-detail-row">
          <span>Next Payout</span>
          <span>{formatSTX(nextPayout)}</span>
        </div>
        {payoutRecipient && (
          <div className="escrow-detail-row">
            <span>Recipient</span>
            <span className="recipient-address">{payoutRecipient}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default EscrowBalance;
