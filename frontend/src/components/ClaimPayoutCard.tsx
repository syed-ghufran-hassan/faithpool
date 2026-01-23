import React, { useState, useEffect, useCallback } from 'react';
import { useWallet } from '../context/WalletContext';
import { formatSTX, formatTimeAgo, shortenAddress } from '../utils/helpers';
import { getContractReadOnly } from '../services/stacks';
import { CONTRACTS } from '../config/constants';
import { Button } from './Button';
import { Badge } from './Badge';
import './ClaimPayoutCard.css';

interface PayoutInfo {
  circleId: number;
  circleName: string;
  amount: number;
  round: number;
  claimableAt: number;
  isClaimable: boolean;
}

interface ClaimPayoutCardProps {
  payout: PayoutInfo;
  onClaim: (circleId: number, round: number) => Promise<void>;
  onViewCircle?: (circleId: number) => void;
}

export const ClaimPayoutCard: React.FC<ClaimPayoutCardProps> = ({
  payout,
  onClaim,
  onViewCircle
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  
  useEffect(() => {
    if (payout.isClaimable) {
      setTimeRemaining('Ready');
      return;
    }
    
    const updateTime = () => {
      const now = Date.now();
      const claimTime = payout.claimableAt * 1000;
      const diff = claimTime - now;
      
      if (diff <= 0) {
        setTimeRemaining('Ready');
        return;
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours > 24) {
        const days = Math.floor(hours / 24);
        setTimeRemaining(`${days}d ${hours % 24}h`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m`);
      } else {
        setTimeRemaining(`${minutes}m`);
      }
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000);
    
    return () => clearInterval(interval);
  }, [payout.claimableAt, payout.isClaimable]);
  
  const handleClaim = async () => {
    if (!payout.isClaimable) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await onClaim(payout.circleId, payout.round);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Claim failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className={`claim-payout-card ${payout.isClaimable ? 'claimable' : 'pending'}`}>
      <div className="payout-header">
        <div className="payout-circle-info">
          <h4 className="payout-circle-name">{payout.circleName}</h4>
          <span className="payout-circle-id">Circle #{payout.circleId}</span>
        </div>
        <Badge variant={payout.isClaimable ? 'success' : 'warning'}>
          {payout.isClaimable ? 'Ready to Claim' : 'Pending'}
        </Badge>
      </div>
      
      <div className="payout-details">
        <div className="payout-amount">
          <span className="amount-label">Payout Amount</span>
          <span className="amount-value">{formatSTX(payout.amount)}</span>
        </div>
        
        <div className="payout-info-grid">
          <div className="payout-info-item">
            <span className="info-label">Round</span>
            <span className="info-value">{payout.round}</span>
          </div>
          <div className="payout-info-item">
            <span className="info-label">Time</span>
            <span className={`info-value ${payout.isClaimable ? 'text-success' : 'text-warning'}`}>
              {timeRemaining}
            </span>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="payout-error">
          {error}
        </div>
      )}
      
      <div className="payout-actions">
        {onViewCircle && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onViewCircle(payout.circleId)}
          >
            View Circle
          </Button>
        )}
        <Button
          variant="primary"
          size="sm"
          onClick={handleClaim}
          loading={isLoading}
          disabled={!payout.isClaimable || isLoading}
        >
          {payout.isClaimable ? 'Claim Payout' : `Wait ${timeRemaining}`}
        </Button>
      </div>
    </div>
  );
};

// List component for multiple payouts
interface ClaimPayoutListProps {
  payouts: PayoutInfo[];
  onClaim: (circleId: number, round: number) => Promise<void>;
  onViewCircle?: (circleId: number) => void;
  emptyMessage?: string;
}

export const ClaimPayoutList: React.FC<ClaimPayoutListProps> = ({
  payouts,
  onClaim,
  onViewCircle,
  emptyMessage = 'No payouts to claim'
}) => {
  const claimableCount = payouts.filter(p => p.isClaimable).length;
  const totalClaimable = payouts
    .filter(p => p.isClaimable)
    .reduce((sum, p) => sum + p.amount, 0);
  
  if (payouts.length === 0) {
    return (
      <div className="claim-payout-empty">
        <span className="empty-icon">📭</span>
        <p>{emptyMessage}</p>
      </div>
    );
  }
  
  return (
    <div className="claim-payout-list">
      {claimableCount > 0 && (
        <div className="claim-summary">
          <span>{claimableCount} payout{claimableCount > 1 ? 's' : ''} ready</span>
          <span className="claim-total">{formatSTX(totalClaimable)}</span>
        </div>
      )}
      
      <div className="payout-cards">
        {payouts.map((payout) => (
          <ClaimPayoutCard
            key={`${payout.circleId}-${payout.round}`}
            payout={payout}
            onClaim={onClaim}
            onViewCircle={onViewCircle}
          />
        ))}
      </div>
    </div>
  );
};

export default ClaimPayoutCard;
