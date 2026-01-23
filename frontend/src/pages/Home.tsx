import { memo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Zap, 
  Target, 
  Award, 
  AlertCircle, 
  BarChart3,
  ArrowRight,
  Users,
  Coins,
  Gift,
  CheckCircle
} from 'lucide-react';
import clsx from 'clsx';
import { Button } from '../components/Button';
import './Home.css';

const STATS = [
  { value: '$2.5M+', label: 'Total Saved' },
  { value: '1,200+', label: 'Active Circles' },
  { value: '15,000+', label: 'Members' },
  { value: '99.9%', label: 'Payout Success' },
];

const STEPS = [
  { 
    number: 1, 
    title: 'Join or Create', 
    description: 'Find an existing circle or create your own with custom rules',
    icon: Users
  },
  { 
    number: 2, 
    title: 'Contribute', 
    description: 'Make regular STX contributions to the shared pool',
    icon: Coins
  },
  { 
    number: 3, 
    title: 'Receive Payout', 
    description: 'When it\'s your turn, receive the entire pool amount',
    icon: Gift
  },
  { 
    number: 4, 
    title: 'Complete Cycle', 
    description: 'Continue until everyone has received their payout',
    icon: CheckCircle
  },
];

const FEATURES = [
  { 
    icon: Shield, 
    title: 'Trustless Security', 
    description: 'Smart contracts ensure funds are safe and payouts are automatic' 
  },
  { 
    icon: Zap, 
    title: 'Fast Transactions', 
    description: 'Built on Stacks, secured by Bitcoin\'s proof of work' 
  },
  { 
    icon: Target, 
    title: 'Flexible Rules', 
    description: 'Customize contribution amounts, frequency, and group size' 
  },
  { 
    icon: Award, 
    title: 'NFT Badges', 
    description: 'Earn reputation badges for successful circle completions' 
  },
  { 
    icon: AlertCircle, 
    title: 'Emergency Fund', 
    description: 'Access emergency payouts when life happens' 
  },
  { 
    icon: BarChart3, 
    title: 'Full Transparency', 
    description: 'All transactions visible on the blockchain' 
  },
];

const Home = memo(function Home() {
  return (
    <div className="home">
      {/* Hero Section */}
      <section className="home__hero">
        <div className="home__hero-content">
          <h1 className="home__hero-title">Save Together, Grow Together</h1>
          <p className="home__hero-description">
            StackSUSU brings the traditional rotating savings circle to the blockchain.
            Join trusted groups, contribute regularly, and take turns receiving the pool.
          </p>
          <div className="home__hero-buttons">
            <Button as={Link} to="/circles" variant="primary" size="lg">
              Explore Circles
            </Button>
            <Button as={Link} to="/create" variant="secondary" size="lg">
              Create Circle
            </Button>
          </div>
        </div>
        <div className="home__hero-visual">
          <div className="home__circle-animation">
            <div className="home__orbit">
              <div className="home__orbit-member"><Users size={16} /></div>
              <div className="home__orbit-member"><Users size={16} /></div>
              <div className="home__orbit-member"><Users size={16} /></div>
              <div className="home__orbit-member"><Users size={16} /></div>
              <div className="home__orbit-member"><Users size={16} /></div>
            </div>
            <div className="home__center-pool">
              <Coins size={24} />
              <span>Pool</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="home__stats">
        {STATS.map((stat, index) => (
          <div key={index} className="home__stat-card">
            <h3 className="home__stat-value">{stat.value}</h3>
            <p className="home__stat-label">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* How It Works */}
      <section className="home__how-it-works">
        <h2 className="home__section-title">How It Works</h2>
        <div className="home__steps">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="home__step">
                <div className="home__step-number">{step.number}</div>
                <div className="home__step-icon">
                  <Icon size={24} />
                </div>
                <h3 className="home__step-title">{step.title}</h3>
                <p className="home__step-description">{step.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section className="home__features">
        <h2 className="home__section-title">Why Choose StackSUSU?</h2>
        <div className="home__feature-grid">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="home__feature-card">
                <div className="home__feature-icon">
                  <Icon size={28} />
                </div>
                <h3 className="home__feature-title">{feature.title}</h3>
                <p className="home__feature-description">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="home__cta">
        <h2 className="home__cta-title">Ready to Start Saving?</h2>
        <p className="home__cta-description">
          Join thousands of members building their financial future together
        </p>
        <Button 
          as={Link} 
          to="/circles" 
          variant="primary" 
          size="lg"
          rightIcon={<ArrowRight size={20} />}
        >
          Get Started
        </Button>
      </section>
    </div>
  );
});

export default Home;
