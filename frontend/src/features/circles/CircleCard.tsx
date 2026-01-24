/**
 * CircleCard Component
 * 
 * Displays a savings circle summary card with status badge,
 * contribution details, member count, and progress indicator.
 * Links to the circle detail page.
 * 
 * @module features/circles/CircleCard
 */
import { Link } from 'react-router-dom';
import './CircleCard.css';

// ============================================================================
// Types
// ============================================================================

/** Circle status options */
type CircleStatus = 'open' | 'active' | 'completed';

/** Props for the CircleCard component */
interface CircleCardProps {
  /** Unique circle identifier */
  id: number;
  /** Circle display name */
  name: string;
  /** Contribution amount in STX */
  contributionAmount: number;
  /** Contribution frequency (e.g., "Weekly", "Monthly") */
  frequency: string;
  /** Current number of members */
  memberCount: number;
  /** Maximum allowed members */
  maxMembers: number;
  /** Current circle status */
  status: CircleStatus;
  /** Formatted next payout date */
  nextPayoutDate?: string;
  /** Circle completion percentage (0-100) */
  progress?: number;
}

// ============================================================================
// Constants
// ============================================================================

/** CSS class mapping for status badge colors */
const STATUS_COLORS: Record<CircleStatus, string> = {
  open: 'status-open',
  active: 'status-active',
  completed: 'status-completed',
};

// ============================================================================
// Helpers
// ============================================================================

/** Format number with locale-specific thousands separators */
const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('en-US').format(amount);
};

// ============================================================================
// Component
// ============================================================================

/**
 * Circle summary card component
 * 
 * @param props - CircleCardProps
 * @returns Link card with circle information
 */
function CircleCard({
  id,
  name,
  contributionAmount,
  frequency,
  memberCount,
  maxMembers,
  status,
  nextPayoutDate,
  progress = 0,
}: CircleCardProps) {
  return (
    <Link to={`/circle/${id}`} className="circle-card">
      <div className="circle-card-header">
        <h3 className="circle-name">{name}</h3>
        <span className={`circle-status ${STATUS_COLORS[status]}`}>
          {status}
        </span>
      </div>

      <div className="circle-card-body">
        <div className="circle-info-row">
          <span className="info-label">Contribution</span>
          <span className="info-value">{formatAmount(contributionAmount)} STX</span>
        </div>
        <div className="circle-info-row">
          <span className="info-label">Frequency</span>
          <span className="info-value">{frequency}</span>
        </div>
        <div className="circle-info-row">
          <span className="info-label">Members</span>
          <span className="info-value">{memberCount}/{maxMembers}</span>
        </div>
        {nextPayoutDate && (
          <div className="circle-info-row">
            <span className="info-label">Next Payout</span>
            <span className="info-value">{nextPayoutDate}</span>
          </div>
        )}
      </div>

      {status === 'active' && (
        <div className="circle-card-footer">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="progress-text">{progress}% complete</span>
        </div>
      )}
    </Link>
  );
}

export default CircleCard;
