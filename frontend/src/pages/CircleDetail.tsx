import { useState, useMemo, useCallback, memo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Coins, 
  AlertTriangle,
  Users,
  Calendar,
  Clock,
  Wallet,
  Target,
  CheckCircle,
  TrendingUp
} from 'lucide-react';
import clsx from 'clsx';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { Modal } from '../components/Modal';
import { Avatar } from '../components/Avatar';
import './CircleDetail.css';

export interface Member {
  address: string;
  position: number;
  contributed: boolean;
  payoutReceived: boolean;
}

export interface CircleData {
  id: number;
  name: string;
  description: string;
  creator: string;
  contribution: number;
  frequency: string;
  currentRound: number;
  totalRounds: number;
  totalPool: number;
  nextPayout: string;
  status: 'active' | 'forming' | 'completed';
  createdAt: string;
  members: Member[];
}

const MOCK_MEMBERS: Member[] = [
  { address: 'SP2J6...8K3N', position: 1, contributed: true, payoutReceived: true },
  { address: 'SP3FK...6N2M', position: 2, contributed: true, payoutReceived: true },
  { address: 'SP1AB...9C4D', position: 3, contributed: true, payoutReceived: true },
  { address: 'SP4XY...2K1L', position: 4, contributed: true, payoutReceived: false },
  { address: 'SP5MN...7P8Q', position: 5, contributed: true, payoutReceived: false },
  { address: 'SP6RS...3T4U', position: 6, contributed: false, payoutReceived: false },
  { address: 'SP7VW...1X2Y', position: 7, contributed: false, payoutReceived: false },
  { address: 'SP8AB...5C6D', position: 8, contributed: false, payoutReceived: false },
];

const STATUS_VARIANTS: Record<string, 'success' | 'warning' | 'secondary'> = {
  active: 'success',
  forming: 'warning',
  completed: 'secondary',
};

const CircleDetail = memo(function CircleDetail() {
  const { id } = useParams();
  const [showContributeModal, setShowContributeModal] = useState(false);

  const circle: CircleData = useMemo(() => ({
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
    status: 'active',
    createdAt: '2024-01-15',
    members: MOCK_MEMBERS
  }), [id]);

  const currentRecipient = useMemo(
    () => circle.members.find(m => m.position === circle.currentRound),
    [circle.members, circle.currentRound]
  );
  const contributedCount = useMemo(
    () => circle.members.filter(m => m.contributed).length,
    [circle.members]
  );
  const progressPercent = useMemo(
    () => (circle.currentRound / circle.totalRounds) * 100,
    [circle.currentRound, circle.totalRounds]
  );

  const handleOpenModal = useCallback(() => setShowContributeModal(true), []);
  const handleCloseModal = useCallback(() => setShowContributeModal(false), []);

  return (
    <div className="circle-detail">
      <Link to="/circles" className="circle-detail__breadcrumb">
        <ArrowLeft size={16} />
        <span>Back to Circles</span>
      </Link>

      <div className="circle-detail__header">
        <div className="circle-detail__header-info">
          <h1 className="circle-detail__title">{circle.name}</h1>
          <p className="circle-detail__description">{circle.description}</p>
          <div className="circle-detail__meta">
            <span>Created by {circle.creator}</span>
            <span>•</span>
            <span>Since {circle.createdAt}</span>
          </div>
        </div>
        <div className="circle-detail__header-actions">
          <Button
            variant="primary"
            onClick={handleOpenModal}
            leftIcon={<Coins size={18} />}
          >
            Contribute {circle.contribution} STX
          </Button>
          <Button variant="outline" leftIcon={<AlertTriangle size={18} />}>
            Emergency Payout
          </Button>
        </div>
      </div>

      <div className="circle-detail__grid">
        {/* Main Stats */}
        <Card className="circle-detail__stats-panel">
          <div className="circle-detail__panel-header">
            <h2 className="circle-detail__panel-title">Circle Stats</h2>
            <Badge variant={STATUS_VARIANTS[circle.status]}>{circle.status}</Badge>
          </div>
          
          <div className="circle-detail__stats-row">
            <div className="circle-detail__stat-item">
              <Wallet size={18} className="circle-detail__stat-icon" />
              <span className="circle-detail__stat-label">Total Pool</span>
              <span className="circle-detail__stat-value">{circle.totalPool} STX</span>
            </div>
            <div className="circle-detail__stat-item">
              <Coins size={18} className="circle-detail__stat-icon" />
              <span className="circle-detail__stat-label">Contribution</span>
              <span className="circle-detail__stat-value">{circle.contribution} STX</span>
            </div>
            <div className="circle-detail__stat-item">
              <Calendar size={18} className="circle-detail__stat-icon" />
              <span className="circle-detail__stat-label">Frequency</span>
              <span className="circle-detail__stat-value">{circle.frequency}</span>
            </div>
            <div className="circle-detail__stat-item">
              <Clock size={18} className="circle-detail__stat-icon" />
              <span className="circle-detail__stat-label">Next Payout</span>
              <span className="circle-detail__stat-value">{circle.nextPayout}</span>
            </div>
          </div>

          <div className="circle-detail__progress-section">
            <div className="circle-detail__progress-header">
              <span>Round {circle.currentRound} of {circle.totalRounds}</span>
              <span>{Math.round(progressPercent)}% Complete</span>
            </div>
            <ProgressBar value={progressPercent} />
          </div>

          <div className="circle-detail__current-round">
            <h3 className="circle-detail__section-title">Current Round Recipient</h3>
            <div className="circle-detail__recipient-card">
              <Avatar size="lg" />
              <div className="circle-detail__recipient-info">
                <span className="circle-detail__recipient-address">{currentRecipient?.address}</span>
                <span className="circle-detail__recipient-position">Position #{currentRecipient?.position}</span>
              </div>
              <div className="circle-detail__recipient-amount">
                <span className="circle-detail__amount-value">{circle.contribution * circle.members.length} STX</span>
                <span className="circle-detail__amount-label">Payout Amount</span>
              </div>
            </div>
          </div>

          <div className="circle-detail__contribution-status">
            <h3 className="circle-detail__section-title">This Round's Contributions</h3>
            <div className="circle-detail__contribution-progress">
              <span>{contributedCount} of {circle.members.length} members contributed</span>
              <ProgressBar 
                value={(contributedCount / circle.members.length) * 100} 
                size="sm"
              />
            </div>
          </div>
        </Card>

        {/* Members List */}
        <Card className="circle-detail__members-panel">
          <div className="circle-detail__panel-header">
            <h2 className="circle-detail__panel-title">
              <Users size={20} />
              Members ({circle.members.length})
            </h2>
          </div>
          
          <div className="circle-detail__members-list">
            {circle.members.map((member) => (
              <div 
                key={member.address} 
                className={clsx(
                  'circle-detail__member-row',
                  member.position === circle.currentRound && 'circle-detail__member-row--current'
                )}
              >
                <div className="circle-detail__member-position">
                  {member.payoutReceived ? (
                    <CheckCircle size={18} className="circle-detail__icon--success" />
                  ) : member.position === circle.currentRound ? (
                    <Target size={18} className="circle-detail__icon--primary" />
                  ) : (
                    <span>#{member.position}</span>
                  )}
                </div>
                <div className="circle-detail__member-info">
                  <span className="circle-detail__member-address">{member.address}</span>
                  <span className="circle-detail__member-status">
                    {member.payoutReceived 
                      ? 'Payout received' 
                      : member.position === circle.currentRound 
                        ? 'Current recipient' 
                        : `Payout in round ${member.position}`}
                  </span>
                </div>
                <div className="circle-detail__member-contribution">
                  {member.contributed ? (
                    <Badge variant="success" size="sm">Contributed</Badge>
                  ) : (
                    <Badge variant="warning" size="sm">Pending</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Transaction History */}
      <Card className="circle-detail__history-panel">
        <h2 className="circle-detail__panel-title">
          <TrendingUp size={20} />
          Transaction History
        </h2>
        <div className="circle-detail__transactions">
          <div className="circle-detail__transaction">
            <Coins size={20} className="circle-detail__tx-icon" />
            <div className="circle-detail__tx-info">
              <span className="circle-detail__tx-type">Contribution</span>
              <span className="circle-detail__tx-meta">SP5MN...7P8Q • 1 hour ago</span>
            </div>
            <span className="circle-detail__tx-amount circle-detail__tx-amount--positive">+50 STX</span>
          </div>
          <div className="circle-detail__transaction">
            <Coins size={20} className="circle-detail__tx-icon" />
            <div className="circle-detail__tx-info">
              <span className="circle-detail__tx-type">Contribution</span>
              <span className="circle-detail__tx-meta">SP4XY...2K1L • 3 hours ago</span>
            </div>
            <span className="circle-detail__tx-amount circle-detail__tx-amount--positive">+50 STX</span>
          </div>
          <div className="circle-detail__transaction">
            <CheckCircle size={20} className="circle-detail__tx-icon circle-detail__icon--success" />
            <div className="circle-detail__tx-info">
              <span className="circle-detail__tx-type">Payout to SP1AB...9C4D</span>
              <span className="circle-detail__tx-meta">Round 3 • 1 week ago</span>
            </div>
            <span className="circle-detail__tx-amount circle-detail__tx-amount--payout">-400 STX</span>
          </div>
        </div>
      </Card>

      {/* Contribute Modal */}
      <Modal 
        isOpen={showContributeModal} 
        onClose={handleCloseModal}
        title="Contribute to Circle"
      >
        <p className="circle-detail__modal-description">
          You are about to contribute to <strong>{circle.name}</strong>
        </p>
        
        <div className="circle-detail__modal-details">
          <div className="circle-detail__detail-row">
            <span>Amount</span>
            <span>{circle.contribution} STX</span>
          </div>
          <div className="circle-detail__detail-row">
            <span>Round</span>
            <span>{circle.currentRound} of {circle.totalRounds}</span>
          </div>
          <div className="circle-detail__detail-row">
            <span>Network Fee</span>
            <span>~0.001 STX</span>
          </div>
        </div>

        <div className="circle-detail__modal-actions">
          <Button variant="outline" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="primary" leftIcon={<Coins size={18} />}>
            Confirm Contribution
          </Button>
        </div>
      </Modal>
    </div>
  );
});

export default CircleDetail;
