import { Link } from 'react-router-dom';
import './CircleCard.css';

interface CircleCardProps {
  id: number;
  name: string;
  contributionAmount: number;
  frequency: string;
  memberCount: number;
  maxMembers: number;
  status: 'open' | 'active' | 'completed';
  nextPayoutDate?: string;
  progress?: number;
}

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
  const statusColors = {
    open: 'status-open',
    active: 'status-active',
    completed: 'status-completed',
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US').format(amount);
  };

  return (
    <Link to={`/circle/${id}`} className="circle-card">
      <div className="circle-card-header">
        <h3 className="circle-name">{name}</h3>
        <span className={`circle-status ${statusColors[status]}`}>
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
