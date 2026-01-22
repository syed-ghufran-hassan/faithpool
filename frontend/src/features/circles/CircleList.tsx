import CircleCard from './CircleCard';
import './CircleList.css';

interface Circle {
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

interface CircleListProps {
  circles: Circle[];
  loading?: boolean;
  emptyMessage?: string;
  layout?: 'grid' | 'list';
}

function CircleList({ 
  circles, 
  loading = false, 
  emptyMessage = 'No circles found',
  layout = 'grid'
}: CircleListProps) {
  if (loading) {
    return (
      <div className={`circle-list circle-list-${layout}`}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
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

  if (circles.length === 0) {
    return (
      <div className="circle-list-empty">
        <div className="empty-icon">🔍</div>
        <p>{emptyMessage}</p>
      </div>
    );
  }

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
