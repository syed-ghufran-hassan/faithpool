/**
 * CircleList Component
 * 
 * Displays a grid or list of savings circles with loading
 * skeleton states and empty state handling.
 * 
 * @module features/circles/CircleList
 */
import CircleCard from './CircleCard';
import './CircleList.css';

// ============================================================================
// Types
// ============================================================================

/** Circle status options */
type CircleStatus = 'open' | 'active' | 'completed';

/** Layout display options */
type LayoutType = 'grid' | 'list';

/** Circle data structure */
interface Circle {
  /** Unique circle identifier */
  id: number;
  /** Circle display name */
  name: string;
  /** Contribution amount in STX */
  contributionAmount: number;
  /** Contribution frequency (e.g., "Weekly") */
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

/** Props for the CircleList component */
interface CircleListProps {
  /** Array of circles to display */
  circles: Circle[];
  /** Show loading skeleton state */
  loading?: boolean;
  /** Message to show when no circles */
  emptyMessage?: string;
  /** Display layout mode */
  layout?: LayoutType;
}

// ============================================================================
// Constants
// ============================================================================

/** Number of skeleton cards to show during loading */
const SKELETON_COUNT = 6;

// ============================================================================
// Component
// ============================================================================

/**
 * Circle list component with loading and empty states
 * 
 * @param props - CircleListProps
 * @returns Grid/list of CircleCards or loading/empty state
 */
function CircleList({ 
  circles, 
  loading = false, 
  emptyMessage = 'No circles found',
  layout = 'grid'
}: CircleListProps) {
  // Loading skeleton state
  if (loading) {
    return (
      <div className={`circle-list circle-list-${layout}`}>
        {Array.from({ length: SKELETON_COUNT }, (_, i) => (
          <div key={i} className="circle-card-skeleton">
            <div className="skeleton-header">
              <div className="skeleton-title" />
              <div className="skeleton-badge" />
            </div>
            <div className="skeleton-body">
              <div className="skeleton-row" />
              <div className="skeleton-row" />
              <div className="skeleton-row" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (circles.length === 0) {
    return (
      <div className="circle-list-empty">
        <div className="empty-icon">🔍</div>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  // Circle list
  return (
    <div className={`circle-list circle-list-${layout}`}>
      {circles.map((circle) => (
        <CircleCard
          key={circle.id}
          id={circle.id}
          name={circle.name}
          contributionAmount={circle.contributionAmount}
          frequency={circle.frequency}
          memberCount={circle.memberCount}
          maxMembers={circle.maxMembers}
          status={circle.status}
          nextPayoutDate={circle.nextPayoutDate}
          progress={circle.progress}
        />
      ))}
    </div>
  );
}

export default CircleList;
