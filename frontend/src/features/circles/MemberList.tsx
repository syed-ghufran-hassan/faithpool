/**
 * MemberList Component
 * 
 * Displays a list of circle members with their contribution
 * status, payout position, and payment progress.
 * 
 * @module features/circles/MemberList
 */
import { useCallback } from 'react';
import './MemberList.css';

// ============================================================================
// Types
// ============================================================================

/** Circle member data structure */
interface Member {
  /** Member's wallet address */
  address: string;
  /** Position in payout order (1-indexed) */
  position: number;
  /** Whether member has received their payout */
  hasReceived: boolean;
  /** Number of contributions made */
  contributionsPaid: number;
  /** Total contributions required */
  totalContributions: number;
  /** Formatted join date */
  joinedAt: string;
}

/** Props for the MemberList component */
interface MemberListProps {
  /** Array of circle members */
  members: Member[];
  /** Current user's wallet address for highlighting */
  currentUserAddress?: string;
  /** Callback when a member row is clicked */
  onMemberClick?: (address: string) => void;
}

// ============================================================================
// Helpers
// ============================================================================

/** Truncate wallet address for display */
const truncateAddress = (address: string): string => {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/** Calculate contribution progress percentage */
const calculateProgress = (paid: number, total: number): number => {
  if (total === 0) return 0;
  return (paid / total) * 100;
};

// ============================================================================
// Component
// ============================================================================

/**
 * Member list component with contribution progress
 * 
 * @param props - MemberListProps
 * @returns Table-style list of circle members
 */
function MemberList({ members, currentUserAddress, onMemberClick }: MemberListProps) {
  const handleRowClick = useCallback(
    (address: string) => {
      onMemberClick?.(address);
    },
    [onMemberClick]
  );

  return (
    <div className="member-list">
      <div className="member-list-header">
        <span className="header-col">#</span>
        <span className="header-col">Member</span>
        <span className="header-col">Contributions</span>
        <span className="header-col">Status</span>
      </div>
      
      <div className="member-list-body">
        {members.map((member) => (
          <div
            key={member.address}
            className={`member-row ${member.address === currentUserAddress ? 'is-current' : ''}`}
            onClick={() => handleRowClick(member.address)}
          >
            <span className="member-position">{member.position}</span>
            <div className="member-info">
              <span className="member-address">
                {truncateAddress(member.address)}
                {member.address === currentUserAddress && (
                  <span className="you-badge">You</span>
                )}
              </span>
              <span className="member-joined">Joined {member.joinedAt}</span>
            </div>
            <div className="member-contributions">
              <span className="contribution-count">
                {member.contributionsPaid}/{member.totalContributions}
              </span>
              <div className="contribution-bar">
                <div 
                  className="contribution-fill" 
                  style={{ 
                    width: `${calculateProgress(member.contributionsPaid, member.totalContributions)}%` 
                  }} 
                />
              </div>
            </div>
            <div className="member-status">
              {member.hasReceived ? (
                <span className="status-received">✓ Received</span>
              ) : (
                <span className="status-pending">Pending</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MemberList;
