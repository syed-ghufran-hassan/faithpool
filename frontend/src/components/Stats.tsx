import './Stats.css';

interface StatItem {
  label: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  icon?: string;
}

interface StatsProps {
  stats: StatItem[];
  columns?: 2 | 3 | 4;
  className?: string;
}

function Stats({ stats, columns = 4, className = '' }: StatsProps) {
  return (
    <div className={`stats stats-cols-${columns} ${className}`}>
      {stats.map((stat, index) => (
        <div key={index} className="stat-card">
          {stat.icon && <span className="stat-icon">{stat.icon}</span>}
          <div className="stat-content">
            <span className="stat-value">{stat.value}</span>
            <span className="stat-label">{stat.label}</span>
            {stat.change && (
              <span className={`stat-change ${stat.change.type}`}>
                {stat.change.type === 'increase' ? '↑' : '↓'}
                {Math.abs(stat.change.value)}%
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Stats;
