import './App.css'

const stats = [
  { label: 'Circles Created', value: '10,248' },
  { label: 'Members Onboarded', value: '48,903' },
  { label: 'STX Saved', value: '1,240,881' },
  { label: 'Payout Success', value: '99.2%' }
]

const steps = [
  {
    title: 'Create a Circle',
    description: 'Set contribution size, members, and payout interval in seconds.'
  },
  {
    title: 'Invite Members',
    description: 'Share a join link or whitelist addresses for trusted groups.'
  },
  {
    title: 'Deposit Together',
    description: 'Members deposit their share into escrow for each round.'
  },
  {
    title: 'Claim Payouts',
    description: 'Payouts rotate automatically based on the circle schedule.'
  }
]

const features = [
  {
    title: 'Escrow-First Security',
    description: 'Deposits are secured in an audited escrow contract until payout.'
  },
  {
    title: 'Emergency Payouts',
    description: 'Unlock funds early with a transparent emergency fee.'
  },
  {
    title: 'NFT Participation',
    description: 'Mint participation NFTs to trade slots or reward reliability.'
  },
  {
    title: 'On-Chain Transparency',
    description: 'Every deposit, payout, and fee is visible on-chain.'
  }
]

const circles = [
  {
    name: 'Builders Circle',
    contribution: '0.5 STX',
    members: '12 Members',
    interval: 'Weekly',
    status: 'Active'
  },
  {
    name: 'Creators Circle',
    contribution: '1 STX',
    members: '18 Members',
    interval: 'Biweekly',
    status: 'Funding'
  },
  {
    name: 'Community Circle',
    contribution: '0.2 STX',
    members: '25 Members',
    interval: 'Monthly',
    status: 'Active'
  }
]

const faqs = [
  {
    question: 'How are payouts determined?',
    answer: 'Each circle follows a rotating schedule, with payouts based on slot order.'
  },
  {
    question: 'What happens if someone misses a deposit?',
    answer: 'Circles can pause until deposits are complete or allow emergency exits.'
  },
  {
    question: 'Can I exit early?',
    answer: 'Use the emergency payout option with a transparent fee.'
  }
]

function App() {
  return (
    <div className="app">
      <header className="nav">
        <div className="brand">
          <span className="brand-mark">S</span>
          <div>
            <p className="brand-name">StackSUSU</p>
            <p className="brand-sub">Decentralized Savings Circles</p>
          </div>
        </div>
        <nav className="nav-links">
          <a href="#how-it-works">How it works</a>
          <a href="#features">Features</a>
          <a href="#circles">Circles</a>
          <a href="#faq">FAQ</a>
        </nav>
        <button className="primary">Launch App</button>
      </header>

      <main>
        <section className="hero">
          <div className="hero-content">
            <p className="pill">Powered by Stacks • Secure escrow</p>
            <h1>Save together, rotate payouts, build wealth on-chain.</h1>
            <p className="hero-sub">
              StackSUSU makes it easy to run rotating savings circles with transparent
              rules, automated escrow, and NFT-based participation rewards.
            </p>
            <div className="hero-actions">
              <button className="primary">Create a circle</button>
              <button className="ghost">View demo</button>
            </div>
            <div className="hero-highlights">
              <div>
                <p className="highlight-value">0.01 STX</p>
                <p className="highlight-label">Minimum contribution</p>
              </div>
              <div>
                <p className="highlight-value">3-25</p>
                <p className="highlight-label">Members per circle</p>
              </div>
              <div>
                <p className="highlight-value">Smart Escrow</p>
                <p className="highlight-label">Always-on transparency</p>
              </div>
            </div>
          </div>
          <div className="hero-card">
            <div className="card-header">
              <div>
                <p className="card-title">Circle Overview</p>
                <p className="card-sub">Next payout in 2 days</p>
              </div>
              <span className="status">Active</span>
            </div>
            <div className="card-body">
              <div className="card-metric">
                <p>Total pot</p>
                <h3>12.5 STX</h3>
              </div>
              <div className="card-metric">
                <p>Members</p>
                <h3>15/18</h3>
              </div>
              <div className="progress">
                <span style={{ width: '72%' }} />
              </div>
              <button className="primary full">Deposit 0.5 STX</button>
            </div>
          </div>
        </section>

        <section className="stats">
          {stats.map((stat) => (
            <div key={stat.label} className="stat">
              <p className="stat-value">{stat.value}</p>
              <p className="stat-label">{stat.label}</p>
            </div>
          ))}
        </section>

        <section id="how-it-works" className="section">
          <div className="section-header">
            <h2>How StackSUSU works</h2>
            <p>Build consistent savings habits with transparent rules and automated payouts.</p>
          </div>
          <div className="grid steps">
            {steps.map((step, index) => (
              <div key={step.title} className="step">
                <span className="step-index">0{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="features" className="section alt">
          <div className="section-header">
            <h2>Designed for trust & accountability</h2>
            <p>Every circle is powered by verifiable on-chain contracts.</p>
          </div>
          <div className="grid features">
            {features.map((feature) => (
              <div key={feature.title} className="feature">
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="circles" className="section">
          <div className="section-header">
            <h2>Featured circles</h2>
            <p>Explore active circles or launch a new one in minutes.</p>
          </div>
          <div className="grid circles">
            {circles.map((circle) => (
              <div key={circle.name} className="circle-card">
                <div>
                  <h3>{circle.name}</h3>
                  <p className="muted">{circle.members} • {circle.interval}</p>
                </div>
                <p className="circle-value">{circle.contribution}</p>
                <span className={`badge ${circle.status === 'Active' ? 'active' : 'pending'}`}>
                  {circle.status}
                </span>
                <button className="ghost">Join circle</button>
              </div>
            ))}
          </div>
        </section>

        <section id="faq" className="section alt">
          <div className="section-header">
            <h2>Questions, answered</h2>
            <p>Everything you need to know before joining a circle.</p>
          </div>
          <div className="faq">
            {faqs.map((item) => (
              <div key={item.question} className="faq-item">
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="cta">
          <div>
            <h2>Start your next savings circle in under a minute.</h2>
            <p>Create, fund, and manage your community savings on Stacks.</p>
          </div>
          <div className="cta-actions">
            <button className="primary">Launch app</button>
            <button className="ghost">Read documentation</button>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div>
          <p className="brand-name">StackSUSU</p>
          <p className="muted">Decentralized Rotating Savings on Stacks.</p>
        </div>
        <div className="footer-links">
          <a href="https://explorer.stacks.co" target="_blank" rel="noreferrer">Stacks Explorer</a>
          <a href="https://docs.stacks.co" target="_blank" rel="noreferrer">Stacks Docs</a>
          <a href="#">Security</a>
        </div>
      </footer>
    </div>
  )
}

export default App
