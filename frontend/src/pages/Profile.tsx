import { Link } from 'react-router-dom';
import './Profile.css';

interface ProfileProps {
  address?: string;
}

function Profile({ address }: ProfileProps) {
  // Mock user data
  const user = {
    address: address || 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N',
    joinedAt: '2024-01-15',
    totalSaved: 1250,
    circlesJoined: 5,
    circlesCreated: 2,
    circlesCompleted: 3,
    payoutsReceived: 8,
    reputation: 98,
  };

  const nftBadges = [
    { id: 1, name: 'Circle Founder', emoji: '🏅', earned: '2024-01-20' },
    { id: 2, name: 'Perfect Contributor', emoji: '💯', earned: '2024-02-15' },
    { id: 3, name: 'Circle Completer', emoji: '🎖️', earned: '2024-03-10' },
    { id: 4, name: 'Trusted Member', emoji: '⭐', earned: '2024-04-05' },
  ];

  const recentCircles = [
    { id: 1, name: 'Tech Builders', role: 'Member', status: 'active' },
    { id: 2, name: 'Stacks Savers', role: 'Creator', status: 'active' },
    { id: 3, name: 'Genesis Circle', role: 'Member', status: 'completed' },
  ];

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">
          <span>👤</span>
        </div>
        <div className="profile-info">
          <h1>My Profile</h1>
          <p className="profile-address">{user.address}</p>
          <p className="profile-joined">Member since {user.joinedAt}</p>
        </div>
        <Link to="/settings" className="btn btn-outline">
          Edit Profile
        </Link>
      </div>

      <div className="profile-grid">
        {/* Stats */}
        <div className="profile-section">
          <h2>Statistics</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-value">{user.totalSaved} STX</span>
              <span className="stat-label">Total Saved</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{user.circlesJoined}</span>
              <span className="stat-label">Circles Joined</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{user.circlesCreated}</span>
              <span className="stat-label">Circles Created</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{user.circlesCompleted}</span>
              <span className="stat-label">Completed</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{user.payoutsReceived}</span>
              <span className="stat-label">Payouts Received</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{user.reputation}%</span>
              <span className="stat-label">Reputation</span>
            </div>
          </div>
        </div>

        {/* NFT Badges */}
        <div className="profile-section">
          <h2>NFT Badges ({nftBadges.length})</h2>
          <div className="badges-grid">
            {nftBadges.map((badge) => (
              <div key={badge.id} className="badge-card">
                <span className="badge-emoji">{badge.emoji}</span>
                <div className="badge-info">
                  <span className="badge-name">{badge.name}</span>
                  <span className="badge-date">Earned {badge.earned}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Circles */}
        <div className="profile-section full-width">
          <div className="section-header">
            <h2>My Circles</h2>
            <Link to="/circles" className="link">View All →</Link>
          </div>
          <div className="circles-list">
            {recentCircles.map((circle) => (
              <Link key={circle.id} to={`/circle/${circle.id}`} className="circle-row">
                <div className="circle-info">
                  <span className="circle-name">{circle.name}</span>
                  <span className="circle-role">{circle.role}</span>
                </div>
                <span className={`circle-status ${circle.status}`}>{circle.status}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
