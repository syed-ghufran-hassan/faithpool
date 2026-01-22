import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './CircleDetail.css';

interface Member {
  address: string;
  position: number;
  contributed: boolean;
  payoutReceived: boolean;
}

function CircleDetail() {
  const { id } = useParams();
  const [showContributeModal, setShowContributeModal] = useState(false);

  // Mock circle data
  const circle = {
    id: Number(id),
    name: 'Tech Builders',
    description: 'A circle for tech enthusiasts to save together and support each other\'s projects.',
    creator: 'SP2J6...8K3N',
    contribution: 50,
    frequency: 'Weekly',
    currentRound: 4,
    totalRounds: 10,
    totalPool: 450,
    nextPayout: '2 days',
    status: 'active' as const,
    createdAt: '2024-01-15',
    members: [
      { address: 'SP2J6...8K3N', position: 1, contributed: true, payoutReceived: true },
      { address: 'SP3FK...6N2M', position: 2, contributed: true, payoutReceived: true },
      { address: 'SP1AB...9C4D', position: 3, contributed: true, payoutReceived: true },
      { address: 'SP4XY...2K1L', position: 4, contributed: true, payoutReceived: false },
      { address: 'SP5MN...7P8Q', position: 5, contributed: true, payoutReceived: false },
      { address: 'SP6RS...3T4U', position: 6, contributed: false, payoutReceived: false },
      { address: 'SP7VW...1X2Y', position: 7, contributed: false, payoutReceived: false },
      { address: 'SP8AB...5C6D', position: 8, contributed: false, payoutReceived: false },
    ] as Member[]
  };

  const currentRecipient = circle.members.find(m => m.position === circle.currentRound);
  const contributedCount = circle.members.filter(m => m.contributed).length;
  const progressPercent = (circle.currentRound / circle.totalRounds) * 100;

  return (
    <div className="circle-detail">
      <div className="breadcrumb">
        <Link to="/circles">← Back to Circles</Link>
      </div>

      <div className="detail-header">
        <div className="header-info">
          <h1>{circle.name}</h1>
          <p className="description">{circle.description}</p>
          <div className="meta">
            <span>Created by {circle.creator}</span>
            <span>•</span>
            <span>Since {circle.createdAt}</span>
          </div>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowContributeModal(true)}
          >
            Contribute {circle.contribution} STX
          </button>
          <button className="btn btn-outline">
            Emergency Payout
          </button>
        </div>
      </div>

      <div className="detail-grid">
        {/* Main Stats */}
        <div className="stats-panel">
          <div className="panel-header">
            <h2>Circle Stats</h2>
            <span className={`status-badge ${circle.status}`}>{circle.status}</span>
          </div>
          
          <div className="stats-row">
            <div className="stat-item">
              <span className="stat-label">Total Pool</span>
              <span className="stat-value">{circle.totalPool} STX</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Contribution</span>
              <span className="stat-value">{circle.contribution} STX</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Frequency</span>
              <span className="stat-value">{circle.frequency}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Next Payout</span>
              <span className="stat-value">{circle.nextPayout}</span>
            </div>
          </div>

          <div className="progress-section">
            <div className="progress-header">
              <span>Round {circle.currentRound} of {circle.totalRounds}</span>
              <span>{Math.round(progressPercent)}% Complete</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          <div className="current-round">
            <h3>Current Round Recipient</h3>
            <div className="recipient-card">
              <div className="recipient-avatar">👤</div>
              <div className="recipient-info">
                <span className="recipient-address">{currentRecipient?.address}</span>
                <span className="recipient-position">Position #{currentRecipient?.position}</span>
              </div>
              <div className="recipient-amount">
                <span className="amount-value">{circle.contribution * circle.members.length} STX</span>
                <span className="amount-label">Payout Amount</span>
              </div>
            </div>
          </div>

          <div className="contribution-status">
            <h3>This Round's Contributions</h3>
            <div className="contribution-progress">
              <span>{contributedCount} of {circle.members.length} members contributed</span>
              <div className="mini-progress">
                <div 
                  className="mini-fill" 
                  style={{ width: `${(contributedCount / circle.members.length) * 100}%` }} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Members List */}
        <div className="members-panel">
          <div className="panel-header">
            <h2>Members ({circle.members.length})</h2>
          </div>
          
          <div className="members-list">
            {circle.members.map((member, index) => (
              <div 
                key={member.address} 
                className={`member-row ${member.position === circle.currentRound ? 'current' : ''}`}
              >
                <div className="member-position">
                  {member.payoutReceived ? '✅' : member.position === circle.currentRound ? '🎯' : `#${member.position}`}
                </div>
                <div className="member-info">
                  <span className="member-address">{member.address}</span>
                  <span className="member-status">
                    {member.payoutReceived 
                      ? 'Payout received' 
                      : member.position === circle.currentRound 
                        ? 'Current recipient' 
                        : `Payout in round ${member.position}`}
                  </span>
                </div>
                <div className="member-contribution">
                  {member.contributed ? (
                    <span className="contributed">✓ Contributed</span>
                  ) : (
                    <span className="pending">Pending</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="history-panel">
        <h2>Transaction History</h2>
        <div className="transactions">
          <div className="transaction">
            <span className="tx-icon">💰</span>
            <div className="tx-info">
              <span className="tx-type">Contribution</span>
              <span className="tx-meta">SP5MN...7P8Q • 1 hour ago</span>
            </div>
            <span className="tx-amount">+50 STX</span>
          </div>
          <div className="transaction">
            <span className="tx-icon">💰</span>
            <div className="tx-info">
              <span className="tx-type">Contribution</span>
              <span className="tx-meta">SP4XY...2K1L • 3 hours ago</span>
            </div>
            <span className="tx-amount">+50 STX</span>
          </div>
          <div className="transaction">
            <span className="tx-icon">🎉</span>
            <div className="tx-info">
              <span className="tx-type">Payout to SP1AB...9C4D</span>
              <span className="tx-meta">Round 3 • 1 week ago</span>
            </div>
            <span className="tx-amount payout">-400 STX</span>
          </div>
        </div>
      </div>

      {/* Contribute Modal */}
      {showContributeModal && (
        <div className="modal-overlay" onClick={() => setShowContributeModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Contribute to Circle</h2>
            <p>You are about to contribute to <strong>{circle.name}</strong></p>
            
            <div className="modal-details">
              <div className="detail-row">
                <span>Amount</span>
                <span>{circle.contribution} STX</span>
              </div>
              <div className="detail-row">
                <span>Round</span>
                <span>{circle.currentRound} of {circle.totalRounds}</span>
              </div>
              <div className="detail-row">
                <span>Network Fee</span>
                <span>~0.001 STX</span>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowContributeModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary">
                Confirm Contribution
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CircleDetail;
