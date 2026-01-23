// Referral Stats Component

import { formatSTX } from '../utils/helpers';
import './ReferralStats.css';

interface ReferralStatsProps {
  referralCode: string;
  totalReferrals: number;
  activeReferrals: number;
  totalEarnings: number;
  pendingEarnings: number;
  onCopyCode: () => void;
  onShare: () => void;
}

export function ReferralStats({
  referralCode,
  totalReferrals,
  activeReferrals,
  totalEarnings,
  pendingEarnings,
  onCopyCode,
  onShare,
}: ReferralStatsProps) {
  const referralLink = `${window.location.origin}/join?ref=${referralCode}`;

  return (
    <div className="referral-stats">
      <div className="referral-header">
        <h3 className="referral-title">Your Referral Program</h3>
        <p className="referral-subtitle">
          Earn 1% of every deposit made by your referrals
        </p>
      </div>

      <div className="referral-code-section">
        <label className="code-label">Your Referral Code</label>
        <div className="code-display">
          <code className="referral-code">{referralCode}</code>
          <button className="btn-copy" onClick={onCopyCode}>
            📋 Copy
          </button>
        </div>
        <div className="referral-link">
          <input
            type="text"
            value={referralLink}
            readOnly
            className="link-input"
          />
          <button className="btn-share" onClick={onShare}>
            Share
          </button>
        </div>
      </div>

      <div className="referral-metrics">
        <div className="metric-card">
          <span className="metric-icon">👥</span>
          <div className="metric-content">
            <span className="metric-value">{totalReferrals}</span>
            <span className="metric-label">Total Referrals</span>
          </div>
        </div>

        <div className="metric-card">
          <span className="metric-icon">✅</span>
          <div className="metric-content">
            <span className="metric-value">{activeReferrals}</span>
            <span className="metric-label">Active in Circles</span>
          </div>
        </div>

        <div className="metric-card highlight">
          <span className="metric-icon">💰</span>
          <div className="metric-content">
            <span className="metric-value">{formatSTX(totalEarnings, 2)}</span>
            <span className="metric-label">Total Earned</span>
          </div>
        </div>

        <div className="metric-card">
          <span className="metric-icon">⏳</span>
          <div className="metric-content">
            <span className="metric-value">{formatSTX(pendingEarnings, 2)}</span>
            <span className="metric-label">Pending</span>
          </div>
        </div>
      </div>

      <div className="referral-info">
        <h4>How it works</h4>
        <ol className="how-it-works">
          <li>Share your referral link with friends</li>
          <li>They join circles using your link</li>
          <li>You earn 1% of their deposits automatically</li>
          <li>Earnings are paid out with each deposit</li>
        </ol>
      </div>
    </div>
  );
}

export default ReferralStats;
