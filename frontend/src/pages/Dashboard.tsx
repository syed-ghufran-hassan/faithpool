import { memo, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Coins, 
  RefreshCw, 
  CheckCircle, 
  Star, 
  Award,
  ArrowRight,
  Plus,
  PiggyBank,
  PartyPopper,
  Hand,
  Trophy,
  FileText,
  Eye
} from 'lucide-react';
import clsx from 'clsx';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import './Dashboard.css';

export interface DashboardProps {
  /** User wallet address */
  address?: string;
  /** Optional class name */
  className?: string;
}

interface UserStats {
  totalSaved: number;
  activeCircles: number;
  completedCircles: number;
  reputation: number;
  nextPayout: string;
  nftBadges: number;
}

interface Circle {
  id: number;
  name: string;
  role: 'member' | 'creator';
  contribution: number;
  nextPayoutPosition: number;
  currentRound: number;
  totalRounds: number;
  status: 'active' | 'pending' | 'completed';
}

interface Activity {
  type: 'contribution' | 'payout' | 'joined' | 'badge';
  circle: string;
  amount: number;
  date: string;
}

// Icon mappings for stat cards and activity items
const _STAT_ICONS = {
  totalSaved: Coins,
  activeCircles: RefreshCw,
  completedCircles: CheckCircle,
  reputation: Star,
};
void _STAT_ICONS; // Reserved for future dynamic stats

const ACTIVITY_ICONS = {
  contribution: PiggyBank,
  payout: PartyPopper,
  joined: Hand,
  badge: Trophy,
};

const Dashboard = memo(function Dashboard({ address, className }: DashboardProps) {
  const navigate = useNavigate();

  // Mock data for demo
  const userStats: UserStats = useMemo(() => ({
    totalSaved: 450,
    activeCircles: 2,
    completedCircles: 3,
    reputation: 95,
    nextPayout: '2 days',
    nftBadges: 3
  }), []);

  const myCircles: Circle[] = useMemo(() => [
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
  ], []);

  const recentActivity: Activity[] = useMemo(() => [
    { type: 'contribution', circle: 'Tech Builders', amount: 50, date: '2 hours ago' },
    { type: 'payout', circle: 'Genesis Circle', amount: 600, date: '1 week ago' },
    { type: 'joined', circle: 'Stacks Savers', amount: 0, date: '2 weeks ago' },
    { type: 'contribution', circle: 'Stacks Savers', amount: 100, date: '2 weeks ago' },
    { type: 'badge', circle: 'Genesis Circle', amount: 0, date: '3 weeks ago' }
  ], []);

  const handleCreateCircle = useCallback(() => {
    navigate('/create');
  }, [navigate]);

  const getActivityMessage = useCallback((activity: Activity): string => {
    switch (activity.type) {
      case 'contribution':
        return `Contributed ${activity.amount} STX`;
      case 'payout':
        return `Received ${activity.amount} STX payout`;
      case 'joined':
        return 'Joined circle';
      case 'badge':
        return 'Earned completion badge';
      default:
        return '';
    }
  }, []);

  return (
    <div className={clsx('dashboard', className)}>
      <div className="dashboard__header">
        <div className="dashboard__header-text">
          <h1 className="dashboard__title">Dashboard</h1>
          <p className="dashboard__wallet">{address}</p>
        </div>
        <Button 
          variant="primary" 
          onClick={handleCreateCircle}
          leftIcon={<Plus size={18} />}
        >
          Create Circle
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="dashboard__stats">
        <Card className="dashboard__stat-card dashboard__stat-card--1">
          <div className="dashboard__stat-icon">
            <Coins size={24} />
          </div>
          <div className="dashboard__stat-content">
            <h3 className="dashboard__stat-value">{userStats.totalSaved} STX</h3>
            <p className="dashboard__stat-label">Total Saved</p>
          </div>
        </Card>
        <Card className="dashboard__stat-card dashboard__stat-card--2">
          <div className="dashboard__stat-icon">
            <RefreshCw size={24} />
          </div>
          <div className="dashboard__stat-content">
            <h3 className="dashboard__stat-value">{userStats.activeCircles}</h3>
            <p className="dashboard__stat-label">Active Circles</p>
          </div>
        </Card>
        <Card className="dashboard__stat-card dashboard__stat-card--3">
          <div className="dashboard__stat-icon">
            <CheckCircle size={24} />
          </div>
          <div className="dashboard__stat-content">
            <h3 className="dashboard__stat-value">{userStats.completedCircles}</h3>
            <p className="dashboard__stat-label">Completed</p>
          </div>
        </Card>
        <Card className="dashboard__stat-card dashboard__stat-card--4">
          <div className="dashboard__stat-icon">
            <Star size={24} />
          </div>
          <div className="dashboard__stat-content">
            <h3 className="dashboard__stat-value">{userStats.reputation}%</h3>
            <p className="dashboard__stat-label">Reputation</p>
          </div>
        </Card>
      </div>

      <div className="dashboard__content">
        {/* My Circles */}
        <div className="dashboard__section">
          <div className="dashboard__section-header">
            <h2 className="dashboard__section-title">My Circles</h2>
            <Link to="/circles" className="dashboard__section-link">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          
          <div className="dashboard__circles">
            {myCircles.map(circle => (
              <Card key={circle.id} className="dashboard__circle-row">
                <div className="dashboard__circle-info">
                  <h3 className="dashboard__circle-name">{circle.name}</h3>
                  <Badge 
                    variant={circle.role === 'creator' ? 'primary' : 'secondary'}
                    size="sm"
                  >
                    {circle.role}
                  </Badge>
                </div>
                <div className="dashboard__circle-details">
                  <div className="dashboard__circle-detail">
                    <span className="dashboard__circle-label">Contribution</span>
                    <span className="dashboard__circle-value">{circle.contribution} STX</span>
                  </div>
                  <div className="dashboard__circle-detail">
                    <span className="dashboard__circle-label">Your Payout</span>
                    <span className="dashboard__circle-value">Position #{circle.nextPayoutPosition}</span>
                  </div>
                  <div className="dashboard__circle-detail">
                    <span className="dashboard__circle-label">Progress</span>
                    <span className="dashboard__circle-value">{circle.currentRound}/{circle.totalRounds}</span>
                  </div>
                </div>
                <div className="dashboard__circle-actions">
                  <Button variant="secondary" size="sm">
                    <Coins size={16} /> Contribute
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/circle/${circle.id}`)}
                  >
                    <Eye size={16} /> View
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity & NFT Badges */}
        <div className="dashboard__sidebar">
          <Card className="dashboard__sidebar-card">
            <h2 className="dashboard__sidebar-title">Recent Activity</h2>
            <div className="dashboard__activity-list">
              {recentActivity.map((activity, index) => {
                const Icon = ACTIVITY_ICONS[activity.type] || FileText;
                return (
                  <div key={index} className="dashboard__activity-item">
                    <span className="dashboard__activity-icon">
                      <Icon size={18} />
                    </span>
                    <div className="dashboard__activity-content">
                      <p className="dashboard__activity-text">
                        {getActivityMessage(activity)}
                      </p>
                      <span className="dashboard__activity-meta">
                        {activity.circle} • {activity.date}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="dashboard__sidebar-card dashboard__nft-card">
            <h2 className="dashboard__sidebar-title">NFT Badges</h2>
            <div className="dashboard__nft-grid">
              <div className="dashboard__nft-badge" title="Circle Founder">
                <Award size={24} />
              </div>
              <div className="dashboard__nft-badge" title="Perfect Contributor">
                <CheckCircle size={24} />
              </div>
              <div className="dashboard__nft-badge" title="Circle Completer">
                <Trophy size={24} />
              </div>
            </div>
            <p className="dashboard__nft-count">{userStats.nftBadges} badges earned</p>
          </Card>
        </div>
      </div>
    </div>
  );
});

export default Dashboard;
