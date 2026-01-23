import { forwardRef, useState, useEffect, useCallback, memo } from 'react';
import { 
  Gift, 
  Clock, 
  Eye, 
  CircleDollarSign,
  RefreshCw,
  AlertCircle,
  Inbox,
  CheckCircle
} from 'lucide-react';
import clsx from 'clsx';
import { formatSTX } from '../utils/helpers';
import { Button } from './Button';
import { Badge } from './Badge';
import './ClaimPayoutCard.css';

export interface PayoutInfo {
  circleId: number;
  circleName: string;
  amount: number;
  round: number;
  claimableAt: number;
  isClaimable: boolean;
}

export interface ClaimPayoutCardProps {
  /** Payout information */
  payout: PayoutInfo;
  /** Claim handler */
  onClaim: (circleId: number, round: number) => Promise<void>;
  /** View circle handler */
  onViewCircle?: (circleId: number) => void;
  /** Optional class name */
  className?: string;
  /** Display variant */
  variant?: 'default' | 'compact';
  /** Show claim animation */
  showClaimAnimation?: boolean;
}

export const ClaimPayoutCard = memo(forwardRef<HTMLDivElement, ClaimPayoutCardProps>(
  function ClaimPayoutCard(
    {
      payout,
      onClaim,
      onViewCircle,
      className,
      variant = 'default',
      showClaimAnimation = true,
    },
    ref
  ) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [timeRemaining, setTimeRemaining] = useState<string>('');
    const [claimed, setClaimed] = useState(false);
    
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
    
    const handleClaim = useCallback(async () => {
      if (!payout.isClaimable) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        await onClaim(payout.circleId, payout.round);
        setClaimed(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Claim failed');
      } finally {
        setIsLoading(false);
      }
    }, [payout.isClaimable, payout.circleId, payout.round, onClaim]);
    
    if (claimed && showClaimAnimation) {
      return (
        <div 
          ref={ref}
          className={clsx(
            'claim-payout-card',
            'claim-payout-card--claimed',
            className
          )}
        >
          <div className="claim-payout-card__success">
            <CheckCircle className="claim-payout-card__success-icon" />
            <span>Payout claimed successfully!</span>
          </div>
        </div>
      );
    }
    
    return (
      <div 
        ref={ref}
        className={clsx(
          'claim-payout-card',
          payout.isClaimable && 'claim-payout-card--claimable',
          !payout.isClaimable && 'claim-payout-card--pending',
          `claim-payout-card--${variant}`,
          className
        )}
      >
        <div className="claim-payout-card__header">
          <div className="claim-payout-card__circle-info">
            <h4 className="claim-payout-card__circle-name">{payout.circleName}</h4>
            <span className="claim-payout-card__circle-id">Circle #{payout.circleId}</span>
          </div>
          <Badge variant={payout.isClaimable ? 'success' : 'warning'}>
            {payout.isClaimable ? 'Ready to Claim' : 'Pending'}
          </Badge>
        </div>
        
        <div className="claim-payout-card__details">
          <div className="claim-payout-card__amount">
            <span className="claim-payout-card__amount-label">
              <CircleDollarSign size={14} />
              Payout Amount
            </span>
            <span className="claim-payout-card__amount-value">{formatSTX(payout.amount)}</span>
          </div>
          
          <div className="claim-payout-card__info-grid">
            <div className="claim-payout-card__info-item">
              <span className="claim-payout-card__info-label">
                <RefreshCw size={12} />
                Round
              </span>
              <span className="claim-payout-card__info-value">{payout.round}</span>
            </div>
            <div className="claim-payout-card__info-item">
              <span className="claim-payout-card__info-label">
                <Clock size={12} />
                Time
              </span>
              <span className={clsx(
                'claim-payout-card__info-value',
                payout.isClaimable && 'claim-payout-card__info-value--success',
                !payout.isClaimable && 'claim-payout-card__info-value--warning'
              )}>
                {timeRemaining}
              </span>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="claim-payout-card__error">
            <AlertCircle size={14} />
            {error}
          </div>
        )}
        
        <div className="claim-payout-card__actions">
          {onViewCircle && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onViewCircle(payout.circleId)}
              leftIcon={<Eye size={14} />}
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
            leftIcon={<Gift size={14} />}
          >
            {payout.isClaimable ? 'Claim Payout' : `Wait ${timeRemaining}`}
          </Button>
        </div>
      </div>
    );
  }
));

// List component for multiple payouts
export interface ClaimPayoutListProps {
  /** Array of payouts */
  payouts: PayoutInfo[];
  /** Claim handler */
  onClaim: (circleId: number, round: number) => Promise<void>;
  /** View circle handler */
  onViewCircle?: (circleId: number) => void;
  /** Empty state message */
  emptyMessage?: string;
  /** Optional class name */
  className?: string;
  /** Display variant for cards */
  cardVariant?: 'default' | 'compact';
}

export const ClaimPayoutList = forwardRef<HTMLDivElement, ClaimPayoutListProps>(
  function ClaimPayoutList(
    {
      payouts,
      onClaim,
      onViewCircle,
      emptyMessage = 'No payouts to claim',
      className,
      cardVariant = 'default',
    },
    ref
  ) {
    const claimableCount = payouts.filter(p => p.isClaimable).length;
    const totalClaimable = payouts
      .filter(p => p.isClaimable)
      .reduce((sum, p) => sum + p.amount, 0);
    
    if (payouts.length === 0) {
      return (
        <div ref={ref} className={clsx('claim-payout-empty', className)}>
          <Inbox className="claim-payout-empty__icon" />
          <p>{emptyMessage}</p>
        </div>
      );
    }
    
    return (
      <div ref={ref} className={clsx('claim-payout-list', className)}>
        {claimableCount > 0 && (
          <div className="claim-payout-list__summary">
            <span className="claim-payout-list__summary-count">
              <Gift size={16} />
              {claimableCount} payout{claimableCount > 1 ? 's' : ''} ready
            </span>
            <span className="claim-payout-list__summary-total">{formatSTX(totalClaimable)}</span>
          </div>
        )}
        
        <div className="claim-payout-list__cards">
          {payouts.map((payout) => (
            <ClaimPayoutCard
              key={`${payout.circleId}-${payout.round}`}
              payout={payout}
              onClaim={onClaim}
              onViewCircle={onViewCircle}
              variant={cardVariant}
            />
          ))}
        </div>
      </div>
    );
  }
);

export { ClaimPayoutCard as default };
