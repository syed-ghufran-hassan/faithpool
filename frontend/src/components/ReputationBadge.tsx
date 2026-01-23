// Reputation Badge Component

import './ReputationBadge.css';

interface ReputationBadgeProps {
  score: number;
  maxScore?: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

type ReputationTier = {
  name: string;
  icon: string;
  color: string;
  minScore: number;
};

const REPUTATION_TIERS: ReputationTier[] = [
  { name: 'Newcomer', icon: '🌱', color: '#94a3b8', minScore: 0 },
  { name: 'Member', icon: '⭐', color: '#22c55e', minScore: 10 },
  { name: 'Trusted', icon: '🌟', color: '#3b82f6', minScore: 50 },
  { name: 'Veteran', icon: '💫', color: '#8b5cf6', minScore: 100 },
  { name: 'Elite', icon: '👑', color: '#f59e0b', minScore: 250 },
  { name: 'Legend', icon: '🏆', color: '#ef4444', minScore: 500 },
];

function getTier(score: number): ReputationTier {
  for (let i = REPUTATION_TIERS.length - 1; i >= 0; i--) {
    if (score >= REPUTATION_TIERS[i].minScore) {
      return REPUTATION_TIERS[i];
    }
  }
  return REPUTATION_TIERS[0];
}

function getNextTier(score: number): ReputationTier | null {
  const currentTier = getTier(score);
  const currentIndex = REPUTATION_TIERS.findIndex(t => t.name === currentTier.name);
  if (currentIndex < REPUTATION_TIERS.length - 1) {
    return REPUTATION_TIERS[currentIndex + 1];
  }
  return null;
}

export function ReputationBadge({
  score,
  maxScore = 1000,
  showLabel = true,
  size = 'md',
}: ReputationBadgeProps) {
  const tier = getTier(score);
  const nextTier = getNextTier(score);
  const progress = nextTier
    ? ((score - tier.minScore) / (nextTier.minScore - tier.minScore)) * 100
    : 100;

  return (
    <div className={`reputation-badge size-${size}`}>
      <div
        className="badge-icon"
        style={{ backgroundColor: `${tier.color}20`, borderColor: tier.color }}
      >
        <span className="tier-icon">{tier.icon}</span>
      </div>

      {showLabel && (
        <div className="badge-info">
          <span className="tier-name" style={{ color: tier.color }}>
            {tier.name}
          </span>
          <span className="tier-score">{score} points</span>

          {nextTier && (
            <div className="tier-progress">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progress}%`, backgroundColor: tier.color }}
                />
              </div>
              <span className="next-tier">
                {nextTier.minScore - score} to {nextTier.name}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Compact version for lists
export function ReputationBadgeCompact({ score }: { score: number }) {
  const tier = getTier(score);

  return (
    <span
      className="reputation-badge-compact"
      style={{ backgroundColor: `${tier.color}20`, color: tier.color }}
      title={`${tier.name} - ${score} points`}
    >
      {tier.icon} {score}
    </span>
  );
}

export default ReputationBadge;
