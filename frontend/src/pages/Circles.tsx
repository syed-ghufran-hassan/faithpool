import { useState, useMemo, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Users, 
  Coins, 
  Calendar,
  Eye,
  RefreshCw,
  Clock,
  CheckCircle
} from 'lucide-react';
import clsx from 'clsx';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Badge } from '../components/Badge';
import { ProgressBar } from '../components/ProgressBar';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import './Circles.css';

export type CircleStatus = 'active' | 'forming' | 'completed';

export interface Circle {
  id: number;
  name: string;
  members: number;
  maxMembers: number;
  contribution: number;
  frequency: string;
  currentRound: number;
  totalRounds: number;
  status: CircleStatus;
  creator: string;
}

const MOCK_CIRCLES: Circle[] = [
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

type FilterType = 'all' | CircleStatus;

const FILTER_OPTIONS: { value: FilterType; label: string; icon: typeof RefreshCw }[] = [
  { value: 'all', label: 'All', icon: RefreshCw },
  { value: 'active', label: 'Active', icon: RefreshCw },
  { value: 'forming', label: 'Forming', icon: Clock },
  { value: 'completed', label: 'Completed', icon: CheckCircle },
];

const STATUS_VARIANTS: Record<CircleStatus, 'success' | 'warning' | 'secondary'> = {
  active: 'success',
  forming: 'warning',
  completed: 'secondary',
};

const Circles = memo(function Circles() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCircles = useMemo(() => 
    MOCK_CIRCLES.filter(circle => {
      const matchesFilter = filter === 'all' || circle.status === filter;
      const matchesSearch = circle.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    }),
    [filter, searchTerm]
  );

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleFilterChange = useCallback((newFilter: FilterType) => {
    setFilter(newFilter);
  }, []);

  return (
    <div className="circles-page">
      <div className="circles-page__header">
        <div className="circles-page__header-content">
          <h1 className="circles-page__title">Explore Circles</h1>
          <p className="circles-page__subtitle">Find a savings circle that fits your goals</p>
        </div>
        <Button 
          as={Link} 
          to="/create" 
          variant="primary"
          leftIcon={<Plus size={18} />}
        >
          Create Circle
        </Button>
      </div>

      <div className="circles-page__filters">
        <div className="circles-page__search">
          <Input
            placeholder="Search circles..."
            value={searchTerm}
            onChange={handleSearchChange}
            leftIcon={<Search size={18} />}
          />
        </div>
        <div className="circles-page__filter-tabs">
          {FILTER_OPTIONS.map(option => (
            <button 
              key={option.value}
              className={clsx(
                'circles-page__filter-tab',
                filter === option.value && 'circles-page__filter-tab--active'
              )}
              onClick={() => handleFilterChange(option.value)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {filteredCircles.length > 0 ? (
        <div className="circles-page__grid">
          {filteredCircles.map(circle => (
            <Card key={circle.id} className="circles-page__card">
              <div className="circles-page__card-header">
                <h3 className="circles-page__card-name">{circle.name}</h3>
                <Badge variant={STATUS_VARIANTS[circle.status]} size="sm">
                  {circle.status}
                </Badge>
              </div>
              
              <div className="circles-page__card-stats">
                <div className="circles-page__stat">
                  <Users size={16} className="circles-page__stat-icon" />
                  <span className="circles-page__stat-label">Members</span>
                  <span className="circles-page__stat-value">{circle.members}/{circle.maxMembers}</span>
                </div>
                <div className="circles-page__stat">
                  <Coins size={16} className="circles-page__stat-icon" />
                  <span className="circles-page__stat-label">Contribution</span>
                  <span className="circles-page__stat-value">{circle.contribution} STX</span>
                </div>
                <div className="circles-page__stat">
                  <Calendar size={16} className="circles-page__stat-icon" />
                  <span className="circles-page__stat-label">Frequency</span>
                  <span className="circles-page__stat-value">{circle.frequency}</span>
                </div>
              </div>

              <div className="circles-page__progress">
                <div className="circles-page__progress-header">
                  <span>Round {circle.currentRound} of {circle.totalRounds}</span>
                  <span>{Math.round((circle.currentRound / circle.totalRounds) * 100)}%</span>
                </div>
                <ProgressBar 
                  value={(circle.currentRound / circle.totalRounds) * 100} 
                  size="sm"
                />
              </div>

              <div className="circles-page__card-footer">
                <span className="circles-page__creator">by {circle.creator}</span>
                <Button 
                  as={Link} 
                  to={`/circle/${circle.id}`} 
                  variant="secondary" 
                  size="sm"
                  leftIcon={<Eye size={16} />}
                >
                  View
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="search"
          title="No circles found"
          description="No circles found matching your criteria"
          action={{
            label: "Create One",
            onClick: () => {},
            href: "/create"
          }}
        />
      )}
    </div>
  );
});

export default Circles;
