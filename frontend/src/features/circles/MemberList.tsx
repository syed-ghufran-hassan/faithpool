import './MemberList.css';

interface Member {
  address: string;
  position: number;
  hasReceived: boolean;
  contributionsPaid: number;
  totalContributions: number;
  joinedAt: string;
}

interface MemberListProps {
  members: Member[];
  currentUserAddress?: string;
  onMemberClick?: (address: string) => void;
}

function MemberList({ members, currentUserAddress, onMemberClick }: MemberListProps) {
  const truncateAddress = (address: string) => {
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

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
            onClick={() => onMemberClick?.(member.address)}
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
                    width: `${(member.contributionsPaid / member.totalContributions) * 100}%` 
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
