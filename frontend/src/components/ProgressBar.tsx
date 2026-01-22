import './ProgressBar.css';

interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  variant?: 'default' | 'success' | 'warning';
  className?: string;
}

function ProgressBar({
  value,
  max = 100,
  size = 'medium',
  showLabel = false,
  variant = 'default',
  className = '',
}: ProgressBarProps) {
  const percentage = Math.min(Math.round((value / max) * 100), 100);
  
  const classes = [
    'progress-container',
    `progress-${size}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {showLabel && (
        <div className="progress-label">
          <span>{value} / {max}</span>
          <span>{percentage}%</span>
        </div>
      )}
      <div className="progress-track">
        <div 
          className={`progress-fill progress-${variant}`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
