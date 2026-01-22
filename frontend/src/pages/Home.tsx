import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Save Together, Grow Together</h1>
          <p>
            StackSUSU brings the traditional rotating savings circle to the blockchain.
            Join trusted groups, contribute regularly, and take turns receiving the pool.
          </p>
          <div className="hero-buttons">
            <Link to="/circles" className="btn btn-primary">Explore Circles</Link>
            <Link to="/create" className="btn btn-secondary">Create Circle</Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="circle-animation">
            <div className="orbit">
              <div className="member"></div>
              <div className="member"></div>
              <div className="member"></div>
              <div className="member"></div>
              <div className="member"></div>
            </div>
            <div className="center-pool">
              <span>Pool</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="stat-card">
          <h3>$2.5M+</h3>
          <p>Total Saved</p>
        </div>
        <div className="stat-card">
          <h3>1,200+</h3>
          <p>Active Circles</p>
        </div>
        <div className="stat-card">
          <h3>15,000+</h3>
          <p>Members</p>
        </div>
        <div className="stat-card">
          <h3>99.9%</h3>
          <p>Payout Success</p>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Join or Create</h3>
            <p>Find an existing circle or create your own with custom rules</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Contribute</h3>
            <p>Make regular STX contributions to the shared pool</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Receive Payout</h3>
            <p>When it's your turn, receive the entire pool amount</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Complete Cycle</h3>
            <p>Continue until everyone has received their payout</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <h2>Why Choose StackSUSU?</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Trustless Security</h3>
            <p>Smart contracts ensure funds are safe and payouts are automatic</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Fast Transactions</h3>
            <p>Built on Stacks, secured by Bitcoin's proof of work</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Flexible Rules</h3>
            <p>Customize contribution amounts, frequency, and group size</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🏆</div>
            <h3>NFT Badges</h3>
            <p>Earn reputation badges for successful circle completions</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🚨</div>
            <h3>Emergency Fund</h3>
            <p>Access emergency payouts when life happens</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Full Transparency</h3>
            <p>All transactions visible on the blockchain</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <h2>Ready to Start Saving?</h2>
        <p>Join thousands of members building their financial future together</p>
        <Link to="/circles" className="btn btn-primary btn-large">Get Started</Link>
      </section>
    </div>
  );
}

export default Home;
