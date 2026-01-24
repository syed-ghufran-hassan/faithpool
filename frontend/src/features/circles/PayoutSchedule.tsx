/**
 * PayoutSchedule Component
 * 
 * Displays a visual timeline of scheduled payouts for a savings
 * circle, showing completed, current, and upcoming payouts.
 * 
 * @module features/circles/PayoutSchedule
 */
import './PayoutSchedule.css';

// ============================================================================
// Types
// ============================================================================

/** Payout event status */
type PayoutStatus = 'completed' | 'current' | 'upcoming';

/** Payout event data structure */
interface PayoutEvent {
  /** Payout round number */
  round: number;
  /** Recipient's wallet address */
  recipientAddress: string;
  /** Payout amount in STX */
  amount: number;
  /** Formatted payout date */
  date: string;
  /** Payout status */
  status: PayoutStatus;
}

/** Props for the PayoutSchedule component */
interface PayoutScheduleProps {
  /** Array of payout events */
  payouts: PayoutEvent[];
  /** Current round number */
  currentRound: number;
  /** Current user's wallet address for highlighting */
  currentUserAddress?: string;
}

// ============================================================================
// Helpers
// ============================================================================

/** Truncate wallet address for display */
const truncateAddress = (address: string): string => {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/** Format number with locale-specific thousands separators */
const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('en-US').format(amount);
};

/** Get timeline dot content based on status */
const getTimelineDot = (status: PayoutStatus): string => {
  if (status === 'completed') return '✓';
  if (status === 'current') return '●';
  return '';
};

// ============================================================================
// Component
// ============================================================================

/**
 * Payout schedule timeline component
 * 
 * @param props - PayoutScheduleProps
 * @returns Visual timeline of payout events
 */
function PayoutSchedule({ payouts, currentUserAddress }: PayoutScheduleProps) {
  const isUserPayout = (address: string): boolean => {
    return address === currentUserAddress;
  };

  return (
    <div className="payout-schedule">
      <div className="schedule-timeline">
        {payouts.map((payout, index) => (
          <div
            key={payout.round}
            className={`schedule-item ${payout.status} ${isUserPayout(payout.recipientAddress) ? 'is-you' : ''}`}
          >
            <div className="timeline-connector">
              <div className="timeline-dot">
                {getTimelineDot(payout.status)}
              </div>
              {index < payouts.length - 1 && <div className="timeline-line" />}
            </div>
            
            <div className="schedule-content">
              <div className="schedule-header">
                <span className="round-label">Round {payout.round}</span>
                <span className="schedule-date">{payout.date}</span>
              </div>
              <div className="schedule-body">
                <span className="recipient">
                  {truncateAddress(payout.recipientAddress)}
                  {isUserPayout(payout.recipientAddress) && (
                    <span className="you-indicator">Your payout!</span>
                  )}
                </span>
                <span className="payout-amount">{formatAmount(payout.amount)} STX</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PayoutSchedule;
