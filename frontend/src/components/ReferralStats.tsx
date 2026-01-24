// Referral Stats Component

import { forwardRef, memo, useState, useCallback } from 'react';
import { 
  Users, 
  CheckCircle, 
  DollarSign, 
  Clock, 
  Copy, 
  Share2, 
  Check,
  Gift
} from 'lucide-react';
import clsx from 'clsx';
import { formatSTX } from '../utils/helpers';
import { Button } from './Button';
import './ReferralStats.css';

export interface ReferralStatsProps {
  /** User's referral code */
  referralCode: string;
  /** Total number of referrals */
  totalReferrals: number;
  /** Number of active referrals */
  activeReferrals: number;
  /** Total earnings in microSTX */
  totalEarnings: number;
  /** Pending earnings in microSTX */
  pendingEarnings: number;
  /** Copy code handler */
  onCopyCode: () => void;
  /** Share handler */
  onShare: () => void;
  /** Optional class name */
  className?: string;
  /** Display variant */
  variant?: 'default' | 'compact';
  /** Hide how it works section */
  hideHowItWorks?: boolean;
}

export const ReferralStats = memo(forwardRef<HTMLDivElement, ReferralStatsProps>(
  function ReferralStats(
    {
      referralCode,
      totalReferrals,
      activeReferrals,
      totalEarnings,
      pendingEarnings,
      onCopyCode,
      onShare,
      className,
      variant = 'default',
      hideHowItWorks = false,
    },
    ref
  ) {
    const [copied, setCopied] = useState(false);
    const referralLink = `${window.location.origin}/join?ref=${referralCode}`;

    const handleCopyCode = useCallback(() => {
      onCopyCode();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }, [onCopyCode]);

    return (
      <div 
        ref={ref}
        className={clsx(
          'referral-stats',
          `referral-stats--${variant}`,
          className
        )}
      >
        <div className="referral-stats__header">
          <div className="referral-stats__header-icon">
            <Gift size={28} />
          </div>
          <div className="referral-stats__header-content">
            <h3 className="referral-stats__title">Your Referral Program</h3>
            <p className="referral-stats__subtitle">
              Earn 1% of every deposit made by your referrals
            </p>
          </div>
        </div>

        <div className="referral-stats__code-section">
          <label className="referral-stats__code-label">Your Referral Code</label>
          <div className="referral-stats__code-display">
            <code className="referral-stats__code">{referralCode}</code>
            <Button 
              variant="primary"
              size="sm"
              onClick={handleCopyCode}
              leftIcon={copied ? <Check size={16} /> : <Copy size={16} />}
            >
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
          <div className="referral-stats__link">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="referral-stats__link-input"
            />
            <Button 
              variant="secondary"
              size="sm"
              onClick={onShare}
              leftIcon={<Share2 size={16} />}
            >
              Share
            </Button>
          </div>
        </div>

        <div className="referral-stats__metrics">
          <div className="referral-stats__metric">
            <Users className="referral-stats__metric-icon" />
            <div className="referral-stats__metric-content">
              <span className="referral-stats__metric-value">{totalReferrals}</span>
              <span className="referral-stats__metric-label">Total Referrals</span>
            </div>
          </div>

          <div className="referral-stats__metric">
            <CheckCircle className="referral-stats__metric-icon" />
            <div className="referral-stats__metric-content">
              <span className="referral-stats__metric-value">{activeReferrals}</span>
              <span className="referral-stats__metric-label">Active in Circles</span>
            </div>
          </div>

          <div className="referral-stats__metric referral-stats__metric--highlight">
            <DollarSign className="referral-stats__metric-icon" />
            <div className="referral-stats__metric-content">
              <span className="referral-stats__metric-value">{formatSTX(totalEarnings, 2)}</span>
              <span className="referral-stats__metric-label">Total Earned</span>
            </div>
          </div>

          <div className="referral-stats__metric">
            <Clock className="referral-stats__metric-icon" />
            <div className="referral-stats__metric-content">
              <span className="referral-stats__metric-value">{formatSTX(pendingEarnings, 2)}</span>
              <span className="referral-stats__metric-label">Pending</span>
            </div>
          </div>
        </div>

        {!hideHowItWorks && (
          <div className="referral-stats__info">
            <h4 className="referral-stats__info-title">How it works</h4>
            <ol className="referral-stats__how-it-works">
              <li>Share your referral link with friends</li>
              <li>They join circles using your link</li>
              <li>You earn 1% of their deposits automatically</li>
              <li>Earnings are paid out with each deposit</li>
            </ol>
          </div>
        )}
      </div>
    );
  }
));

export { ReferralStats as default };
