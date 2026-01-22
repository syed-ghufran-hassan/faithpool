import { Link } from 'react-router-dom';
import './Dashboard.css';

interface DashboardProps {
  address?: string;
}

function Dashboard({ address }: DashboardProps) {
  // Mock data for demo
  const userStats = {
    totalSaved: 450,
    activeCircles: 2,
    completedCircles: 3,
    reputation: 95,
    nextPayout: '2 days',
    nftBadges: 3
  };

  const myCircles = [
    {
      id: 1,
      name: 'Tech Builders',
      role: 'member',
      contribution: 50,
      nextPayoutPosition: 4,
      currentRound: 3,
      totalRounds: 10,
      status: 'active'
    },
    {
      id: 2,
      name: 'Stacks Savers',
      role: 'creator',
      contribution: 100,
      nextPayoutPosition: 2,
      currentRound: 2,
      totalRounds: 5,
      status: 'active'
    }
  ];

  const recentActivity = [
    { type: 'contribution', circle: 'Tech Builders', amount: 50, date: '2 hours ago' },
    { type: 'payout', circle: 'Genesis Circle', amount: 600, date: '1 week ago' },
    { type: 'joined', circle: 'Stacks Savers', amount: 0, date: '2 weeks ago' },
    { type: 'contribution', circle: 'Stacks Savers', amount: 100, date: '2 weeks ago' },
    { type: 'badge', circle: 'Genesis Circle', amount: 0, date: '3 weeks ago' }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'contribution': return '💰';
      case 'payout': return '🎉';
      case 'joined': return '👋';
      case 'badge': return '🏆';
      default: return '📋';
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p className="wallet-display">{address}</p>
        </div>
        <Link to="/create" className="btn btn-primary">
          + Create Circle
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card gradient-1">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>{userStats.totalSaved} STX</h3>
            <p>Total Saved</p>
          </div>
        </div>
        <div className="stat-card gradient-2">
          <div className="stat-icon">🔄</div>
          <div className="stat-content">
            <h3>{userStats.activeCircles}</h3>
            <p>Active Circles</p>
          </div>
        </div>
        <div className="stat-card gradient-3">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{userStats.completedCircles}</h3>
            <p>Completed</p>
          </div>
        </div>
        <div className="stat-card gradient-4">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <h3>{userStats.reputation}%</h3>
            <p>Reputation</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* My Circles */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>My Circles</h2>
            <Link to="/circles" className="link">View All →</Link>
          </div>
          
          <div className="my-circles">
            {myCircles.map(circle => (
              <div key={circle.id} className="circle-row">
                <div className="circle-info">
                  <h3>{circle.name}</h3>
                  <span className={`role-badge ${circle.role}`}>{circle.role}</span>
                </div>
                <div className="circle-details">
                  <div className="detail">
                    <span className="label">Contribution</span>
                    <span className="value">{circle.contribution} STX</span>
                  </div>
                  <div className="detail">
                    <span className="label">Your Payout</span>
                    <span className="value">Position #{circle.nextPayoutPosition}</span>
                  </div>
                  <div className="detail">
                    <span className="label">Progress</span>
                    <span className="value">{circle.currentRound}/{circle.totalRounds}</span>
                  </div>
                </div>
                <div className="circle-actions">
                  <button className="btn btn-secondary btn-small">Contribute</button>
                  <Link to={`/circle/${circle.id}`} className="btn btn-outline btn-small">View</Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity & NFT Badges */}
        <div className="dashboard-sidebar">
          <div className="sidebar-card">
            <h2>Recent Activity</h2>
            <div className="activity-list">
              {recentActivity.map((activity, index) => (
                <div key={index} className="activity-item">
                  <span className="activity-icon">{getActivityIcon(activity.type)}</span>
                  <div className="activity-content">
                    <p>
                      {activity.type === 'contribution' && `Contributed ${activity.amount} STX`}
                      {activity.type === 'payout' && `Received ${activity.amount} STX payout`}
                      {activity.type === 'joined' && `Joined circle`}
                      {activity.type === 'badge' && `Earned completion badge`}
                    </p>
                    <span className="activity-meta">{activity.circle} • {activity.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="sidebar-card nft-card">
            <h2>NFT Badges</h2>
            <div className="nft-grid">
              <div className="nft-badge" title="Circle Founder">🏅</div>
              <div className="nft-badge" title="Perfect Contributor">💯</div>
              <div className="nft-badge" title="Circle Completer">🎖️</div>
            </div>
            <p className="nft-count">{userStats.nftBadges} badges earned</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
