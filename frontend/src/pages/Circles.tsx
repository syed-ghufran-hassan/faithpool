import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Circles.css';

interface Circle {
  id: number;
  name: string;
  members: number;
  maxMembers: number;
  contribution: number;
  frequency: string;
  currentRound: number;
  totalRounds: number;
  status: 'active' | 'forming' | 'completed';
  creator: string;
}

const mockCircles: Circle[] = [
  {
    id: 1,
    name: "Tech Builders",
    members: 8,
    maxMembers: 10,
    contribution: 50,
    frequency: "Weekly",
    currentRound: 4,
    totalRounds: 10,
    status: 'active',
    creator: "SP2J6...8K3N"
  },
  {
    id: 2,
    name: "Stacks Savers",
    members: 5,
    maxMembers: 5,
    contribution: 100,
    frequency: "Monthly",
    currentRound: 2,
    totalRounds: 5,
    status: 'active',
    creator: "SP3FK...6N2M"
  },
  {
    id: 3,
    name: "Community Fund",
    members: 3,
    maxMembers: 12,
    contribution: 25,
    frequency: "Bi-weekly",
    currentRound: 0,
    totalRounds: 12,
    status: 'forming',
    creator: "SP1AB...9C4D"
  },
  {
    id: 4,
    name: "Genesis Circle",
    members: 6,
    maxMembers: 6,
    contribution: 200,
    frequency: "Monthly",
    currentRound: 6,
    totalRounds: 6,
    status: 'completed',
    creator: "SP4XY...2K1L"
  },
  {
    id: 5,
    name: "Bitcoin Believers",
    members: 7,
    maxMembers: 8,
    contribution: 75,
    frequency: "Weekly",
    currentRound: 3,
    totalRounds: 8,
    status: 'active',
    creator: "SP5MN...7P8Q"
  },
  {
    id: 6,
    name: "DeFi Dreamers",
    members: 2,
    maxMembers: 10,
    contribution: 150,
    frequency: "Monthly",
    currentRound: 0,
    totalRounds: 10,
    status: 'forming',
    creator: "SP6RS...3T4U"
  }
];

function Circles() {
  const [filter, setFilter] = useState<'all' | 'active' | 'forming' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCircles = mockCircles.filter(circle => {
    const matchesFilter = filter === 'all' || circle.status === filter;
    const matchesSearch = circle.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'forming': return '#f59e0b';
      case 'completed': return '#6b7280';
      default: return '#6b7280';
    }
  };

  return (
    <div className="circles-page">
      <div className="circles-header">
        <div className="header-content">
          <h1>Explore Circles</h1>
          <p>Find a savings circle that fits your goals</p>
        </div>
        <Link to="/create" className="btn btn-primary">
          + Create Circle
        </Link>
      </div>

      <div className="circles-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search circles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Active
          </button>
          <button 
            className={`filter-tab ${filter === 'forming' ? 'active' : ''}`}
            onClick={() => setFilter('forming')}
          >
            Forming
          </button>
          <button 
            className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
        </div>
      </div>

      <div className="circles-grid">
        {filteredCircles.map(circle => (
          <div key={circle.id} className="circle-card">
            <div className="circle-card-header">
              <h3>{circle.name}</h3>
              <span 
                className="status-badge"
                style={{ backgroundColor: getStatusColor(circle.status) }}
              >
                {circle.status}
              </span>
            </div>
            
            <div className="circle-card-stats">
              <div className="stat">
                <span className="stat-label">Members</span>
                <span className="stat-value">{circle.members}/{circle.maxMembers}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Contribution</span>
                <span className="stat-value">{circle.contribution} STX</span>
              </div>
              <div className="stat">
                <span className="stat-label">Frequency</span>
                <span className="stat-value">{circle.frequency}</span>
              </div>
            </div>

            <div className="circle-progress">
              <div className="progress-header">
                <span>Round {circle.currentRound} of {circle.totalRounds}</span>
                <span>{Math.round((circle.currentRound / circle.totalRounds) * 100)}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${(circle.currentRound / circle.totalRounds) * 100}%` }}
                />
              </div>
            </div>

            <div className="circle-card-footer">
              <span className="creator">by {circle.creator}</span>
              <Link to={`/circle/${circle.id}`} className="btn btn-secondary btn-small">
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filteredCircles.length === 0 && (
        <div className="no-results">
          <p>No circles found matching your criteria</p>
          <Link to="/create" className="btn btn-primary">Create One</Link>
        </div>
      )}
    </div>
  );
}

export default Circles;
