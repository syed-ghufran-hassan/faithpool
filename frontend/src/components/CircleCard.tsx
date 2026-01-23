// CircleCard component - Display circle summary

import { Link } from 'react-router-dom';
import { formatSTX, blocksToTime } from '../utils/helpers';
import { Badge } from './Badge';
import { ProgressBar } from './ProgressBar';
import { Card } from './Card';
import './CircleCard.css';

interface CircleCardProps {
  id: number;
  name: string;
  contribution: number;
  currentMembers: number;
  maxMembers: number;
  status: 'open' | 'active' | 'completed';
  frequency: string;
  currentRound?: number;
  escrowBalance?: number;
  creator?: string;
  onClick?: () => void;
}

function getStatusColor(status: string): 'success' | 'warning' | 'default' | 'error' {
  switch (status) {
    case 'active':
      return 'success';
    case 'open':
      return 'warning';
    case 'completed':
      return 'default';
    default:
      return 'default';
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'active':
      return 'Active';
    case 'open':
      return 'Open';
    case 'completed':
      return 'Completed';
    default:
      return status;
  }
}

export function CircleCard({
  id,
  name,
  contribution,
  currentMembers,
  maxMembers,
  status,
  frequency,
  currentRound,
  escrowBalance,
  creator,
  onClick,
}: CircleCardProps) {
  const memberProgress = (currentMembers / maxMembers) * 100;
  const slotsAvailable = maxMembers - currentMembers;

  return (
    <Card className="circle-card" onClick={onClick}>
      <Link to={`/circles/${id}`} className="circle-card-link">
        <div className="circle-card-header">
          <h3 className="circle-name">{name}</h3>
          <Badge variant={getStatusColor(status)}>
            {getStatusLabel(status)}
          </Badge>
        </div>

        <div className="circle-card-body">
          <div className="circle-stat">
            <span className="stat-label">Contribution</span>
            <span className="stat-value">{formatSTX(contribution, 2)}</span>
          </div>

          <div className="circle-stat">
            <span className="stat-label">Frequency</span>
            <span className="stat-value capitalize">{frequency}</span>
          </div>

          <div className="circle-stat">
            <span className="stat-label">Members</span>
            <span className="stat-value">
              {currentMembers} / {maxMembers}
            </span>
          </div>

          {currentRound !== undefined && status === 'active' && (
            <div className="circle-stat">
              <span className="stat-label">Round</span>
              <span className="stat-value">{currentRound} / {maxMembers}</span>
            </div>
          )}
        </div>

        <div className="circle-card-progress">
          <ProgressBar 
            value={memberProgress} 
            max={100}
            size="sm"
            color={status === 'open' ? 'warning' : 'primary'}
          />
          {status === 'open' && slotsAvailable > 0 && (
            <span className="slots-available">
              {slotsAvailable} slot{slotsAvailable > 1 ? 's' : ''} available
            </span>
          )}
        </div>

        {escrowBalance !== undefined && escrowBalance > 0 && (
          <div className="circle-card-escrow">
            <span className="escrow-label">Pool</span>
            <span className="escrow-value">{formatSTX(escrowBalance, 2)}</span>
          </div>
        )}
      </Link>
    </Card>
  );
}

export default CircleCard;
