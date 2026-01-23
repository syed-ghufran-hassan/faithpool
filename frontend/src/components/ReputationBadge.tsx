// Reputation Badge Component

import { forwardRef, memo, useMemo, type ReactNode } from 'react';
import { 
  Sprout, 
  Star, 
  Sparkles, 
  Zap, 
  Crown, 
  Trophy 
} from 'lucide-react';
import clsx from 'clsx';
import './ReputationBadge.css';

export type ReputationSize = 'sm' | 'md' | 'lg';

export interface ReputationTier {
  name: string;
  icon: ReactNode;
  emoji: string;
  color: string;
  minScore: number;
}

export interface ReputationBadgeProps {
  /** Reputation score */
  score: number;
  /** Maximum score for display purposes */
  maxScore?: number;
  /** Show label and progress */
  showLabel?: boolean;
  /** Size variant */
  size?: ReputationSize;
  /** Optional class name */
  className?: string;
  /** Show progress to next tier */
  showProgress?: boolean;
  /** Use emoji instead of Lucide icons */
  useEmoji?: boolean;
}

const createTiers = (): ReputationTier[] => [
  { name: 'Newcomer', emoji: '🌱', icon: <Sprout size={16} />, color: '#94a3b8', minScore: 0 },
  { name: 'Member', emoji: '⭐', icon: <Star size={16} />, color: '#22c55e', minScore: 10 },
  { name: 'Trusted', emoji: '🌟', icon: <Sparkles size={16} />, color: '#3b82f6', minScore: 50 },
  { name: 'Veteran', emoji: '💫', icon: <Zap size={16} />, color: '#8b5cf6', minScore: 100 },
  { name: 'Elite', emoji: '👑', icon: <Crown size={16} />, color: '#f59e0b', minScore: 250 },
  { name: 'Legend', emoji: '🏆', icon: <Trophy size={16} />, color: '#ef4444', minScore: 500 },
];

const REPUTATION_TIERS = createTiers();

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

export const ReputationBadge = memo(forwardRef<HTMLDivElement, ReputationBadgeProps>(
  function ReputationBadge(
    {
      score,
      maxScore = 1000,
      showLabel = true,
      size = 'md',
      className,
      showProgress = true,
      useEmoji = true,
    },
    ref
  ) {
    const { tier, nextTier, progress } = useMemo(() => {
      const t = getTier(score);
      const nt = getNextTier(score);
      const p = nt
        ? ((score - t.minScore) / (nt.minScore - t.minScore)) * 100
        : 100;
      return { tier: t, nextTier: nt, progress: p };
    }, [score]);

    const iconSize = size === 'lg' ? 32 : size === 'md' ? 24 : 16;

    return (
      <div 
        ref={ref}
        className={clsx(
          'reputation-badge',
          `reputation-badge--${size}`,
          className
        )}
      >
        <div
          className="reputation-badge__icon"
          style={{ 
            backgroundColor: `${tier.color}20`, 
            borderColor: tier.color 
          }}
        >
          {useEmoji ? (
            <span className="reputation-badge__emoji">{tier.emoji}</span>
          ) : (
            <span className="reputation-badge__lucide" style={{ color: tier.color }}>
              {tier.icon}
            </span>
          )}
        </div>

        {showLabel && (
          <div className="reputation-badge__info">
            <span 
              className="reputation-badge__tier-name" 
              style={{ color: tier.color }}
            >
              {tier.name}
            </span>
            <span className="reputation-badge__score">{score} points</span>

            {showProgress && nextTier && (
              <div className="reputation-badge__progress">
                <div className="reputation-badge__progress-bar">
                  <div
                    className="reputation-badge__progress-fill"
                    style={{ width: `${progress}%`, backgroundColor: tier.color }}
                  />
                </div>
                <span className="reputation-badge__next-tier">
                  {nextTier.minScore - score} to {nextTier.name}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
));

// Compact version for lists
export interface ReputationBadgeCompactProps {
  /** Reputation score */
  score: number;
  /** Optional class name */
  className?: string;
  /** Show score number */
  showScore?: boolean;
}

export const ReputationBadgeCompact = memo(forwardRef<HTMLSpanElement, ReputationBadgeCompactProps>(
  function ReputationBadgeCompact(
    { score, className, showScore = true },
    ref
  ) {
    const tier = useMemo(() => getTier(score), [score]);

    return (
      <span
        ref={ref}
        className={clsx('reputation-badge-compact', className)}
        style={{ 
          backgroundColor: `${tier.color}20`, 
          color: tier.color 
        }}
        title={`${tier.name} - ${score} points`}
      >
        {tier.emoji} {showScore && score}
      </span>
    );
  }
));

export { ReputationBadge as default };
