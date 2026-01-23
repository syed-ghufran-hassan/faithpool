// MemberList component - Display circle members

import { truncateAddress } from '../utils/helpers';
import Avatar from './Avatar';
import Badge from './Badge';
import './MemberList.css';

interface Member {
  address: string;
  slot: number;
  hasDeposited?: boolean;
  isCreator?: boolean;
  isCurrentTurn?: boolean;
}

interface MemberListProps {
  members: Member[];
  currentRound?: number;
  userAddress?: string | null;
  onMemberClick?: (address: string) => void;
}

export function MemberList({ 
  members, 
  currentRound, 
  userAddress,
  onMemberClick 
}: MemberListProps) {
  return (
    <div className="member-list">
      <h4 className="member-list-title">
        Members ({members.length})
      </h4>
      
      <ul className="member-items">
        {members.map((member, index) => {
          const isUser = member.address === userAddress;
          const isCurrentTurn = currentRound !== undefined && member.slot === currentRound;
          
          return (
            <li 
              key={member.address}
              className={`member-item ${isUser ? 'is-user' : ''} ${isCurrentTurn ? 'is-current-turn' : ''}`}
              onClick={() => onMemberClick?.(member.address)}
            >
              <div className="member-info">
                <Avatar 
                  address={member.address}
                  size="sm"
                />
                <div className="member-details">
                  <span className="member-address">
                    {truncateAddress(member.address)}
                    {isUser && <span className="you-badge">You</span>}
                  </span>
                  <span className="member-slot">Slot #{member.slot}</span>
                </div>
              </div>
              
              <div className="member-status">
                {member.isCreator && (
                  <Badge variant="default" size="sm">Creator</Badge>
                )}
                {isCurrentTurn && (
                  <Badge variant="success" size="sm">Receiving</Badge>
                )}
                {member.hasDeposited && (
                  <span className="deposit-check" title="Deposited">✓</span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// Compact version for sidebar/preview
export function MemberListCompact({ 
  members, 
  maxDisplay = 5 
}: { 
  members: Member[];
  maxDisplay?: number;
}) {
  const displayMembers = members.slice(0, maxDisplay);
  const remaining = members.length - maxDisplay;

  return (
    <div className="member-list-compact">
      <div className="member-avatars">
        {displayMembers.map((member, index) => (
          <Avatar 
            key={member.address}
            address={member.address}
            size="sm"
            style={{ marginLeft: index > 0 ? '-8px' : 0, zIndex: displayMembers.length - index }}
          />
        ))}
        {remaining > 0 && (
          <div className="member-count-badge">
            +{remaining}
          </div>
        )}
      </div>
    </div>
  );
}

export default MemberList;
