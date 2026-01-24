import { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Settings, 
  Award, 
  Coins, 
  Users, 
  CheckCircle, 
  Gift, 
  Star,
  ArrowRight 
} from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import './Profile.css';

export interface ProfileProps {
  address?: string;
}

interface StatItem {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}

interface NFTBadge {
  id: number;
  name: string;
  emoji: string;
  earned: string;
}

interface CircleItem {
  id: number;
  name: string;
  role: 'Member' | 'Creator';
  status: 'active' | 'completed';
}

// Mock data - in production would come from API
const MOCK_USER = {
  address: 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N',
  joinedAt: '2024-01-15',
  totalSaved: 1250,
  circlesJoined: 5,
  circlesCreated: 2,
  circlesCompleted: 3,
  payoutsReceived: 8,
  reputation: 98,
};

const MOCK_NFT_BADGES: NFTBadge[] = [
  { id: 1, name: 'Circle Founder', emoji: '🏅', earned: '2024-01-20' },
  { id: 2, name: 'Perfect Contributor', emoji: '💯', earned: '2024-02-15' },
  { id: 3, name: 'Circle Completer', emoji: '🎖️', earned: '2024-03-10' },
  { id: 4, name: 'Trusted Member', emoji: '⭐', earned: '2024-04-05' },
];

const MOCK_CIRCLES: CircleItem[] = [
  { id: 1, name: 'Tech Builders', role: 'Member', status: 'active' },
  { id: 2, name: 'Stacks Savers', role: 'Creator', status: 'active' },
  { id: 3, name: 'Genesis Circle', role: 'Member', status: 'completed' },
];

const Profile = memo(function Profile({ address }: ProfileProps) {
  const user = useMemo(() => ({
    ...MOCK_USER,
    address: address || MOCK_USER.address,
  }), [address]);

  const stats: StatItem[] = useMemo(() => [
    { label: 'Total Saved', value: `${user.totalSaved} STX`, icon: <Coins size={20} /> },
    { label: 'Circles Joined', value: user.circlesJoined, icon: <Users size={20} /> },
    { label: 'Circles Created', value: user.circlesCreated, icon: <Users size={20} /> },
    { label: 'Completed', value: user.circlesCompleted, icon: <CheckCircle size={20} /> },
    { label: 'Payouts Received', value: user.payoutsReceived, icon: <Gift size={20} /> },
    { label: 'Reputation', value: `${user.reputation}%`, icon: <Star size={20} /> },
  ], [user]);

  return (
    <div className="profile">
      <Card className="profile__header">
        <Avatar address={user.address} size="xl" />
        <div className="profile__info">
          <h1 className="profile__title">My Profile</h1>
          <p className="profile__address">{user.address}</p>
          <p className="profile__joined">Member since {user.joinedAt}</p>
        </div>
        <Link
          to="/settings"
          className="button button--secondary"
        >
          <Settings size={18} />
          Edit Profile
        </Link>
      </Card>

      <div className="profile__grid">
        {/* Stats */}
        <Card className="profile__section">
          <h2 className="profile__section-title">Statistics</h2>
          <div className="profile__stats">
            {stats.map((stat) => (
              <div key={stat.label} className="profile__stat">
                <div className="profile__stat-icon">{stat.icon}</div>
                <span className="profile__stat-value">{stat.value}</span>
                <span className="profile__stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* NFT Badges */}
        <Card className="profile__section">
          <h2 className="profile__section-title">
            <Award size={20} />
            NFT Badges ({MOCK_NFT_BADGES.length})
          </h2>
          <div className="profile__badges">
            {MOCK_NFT_BADGES.map((badge) => (
              <div key={badge.id} className="profile__badge">
                <span className="profile__badge-emoji">{badge.emoji}</span>
                <div className="profile__badge-info">
                  <span className="profile__badge-name">{badge.name}</span>
                  <span className="profile__badge-date">Earned {badge.earned}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Circles */}
        <Card className="profile__section profile__section--full">
          <div className="profile__section-header">
            <h2 className="profile__section-title">My Circles</h2>
            <Link to="/circles" className="profile__link">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="profile__circles">
            {MOCK_CIRCLES.map((circle) => (
              <Link 
                key={circle.id} 
                to={`/circle/${circle.id}`} 
                className="profile__circle"
              >
                <div className="profile__circle-info">
                  <span className="profile__circle-name">{circle.name}</span>
                  <Badge variant="secondary" size="sm">{circle.role}</Badge>
                </div>
                <Badge 
                  variant={circle.status === 'active' ? 'success' : 'info'}
                  size="sm"
                >
                  {circle.status}
                </Badge>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
});

export { Profile as default };
