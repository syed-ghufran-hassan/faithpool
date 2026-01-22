import './About.css';

function About() {
  return (
    <div className="about-page">
      <section className="about-hero">
        <h1>About StackSusu</h1>
        <p className="hero-subtitle">
          Decentralized savings circles powered by the Stacks blockchain
        </p>
      </section>

      <section className="about-content">
        <div className="about-section">
          <h2>What is StackSusu?</h2>
          <p>
            StackSusu brings the traditional concept of rotating savings circles 
            (known as "susu", "tanda", "chit fund", or "ROSCA") to the blockchain. 
            Our platform enables communities to save together in a transparent, 
            secure, and trustless environment.
          </p>
        </div>

        <div className="about-section">
          <h2>How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Create or Join</h3>
              <p>Start a new savings circle or join an existing one that fits your goals</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Contribute</h3>
              <p>Make regular STX deposits according to the circle's schedule</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Receive Payout</h3>
              <p>When it's your turn, receive the pooled funds automatically</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h3>Earn NFT</h3>
              <p>Complete the cycle and earn an NFT badge proving your reliability</p>
            </div>
          </div>
        </div>

        <div className="about-section">
          <h2>Why Blockchain?</h2>
          <div className="benefits">
            <div className="benefit">
              <span className="benefit-icon">🔒</span>
              <h4>Security</h4>
              <p>Smart contracts ensure funds are handled according to rules</p>
            </div>
            <div className="benefit">
              <span className="benefit-icon">👁️</span>
              <h4>Transparency</h4>
              <p>All transactions are public and verifiable on-chain</p>
            </div>
            <div className="benefit">
              <span className="benefit-icon">🤖</span>
              <h4>Automation</h4>
              <p>Distributions happen automatically without intermediaries</p>
            </div>
            <div className="benefit">
              <span className="benefit-icon">🌍</span>
              <h4>Accessibility</h4>
              <p>Anyone with a Stacks wallet can participate globally</p>
            </div>
          </div>
        </div>

        <div className="about-section">
          <h2>Our Mission</h2>
          <p>
            We believe in the power of community-based savings. By combining 
            traditional financial practices with blockchain technology, we're 
            creating a more inclusive and transparent financial system for everyone.
          </p>
        </div>

        <div className="about-section">
          <h2>Built on Stacks</h2>
          <p>
            StackSusu is built on the Stacks blockchain, which brings smart contracts 
            and DeFi to Bitcoin. This means your savings circles benefit from Bitcoin's 
            security while enjoying the programmability of Clarity smart contracts.
          </p>
          <div className="tech-stack">
            <span className="tech-badge">Stacks</span>
            <span className="tech-badge">Clarity</span>
            <span className="tech-badge">Bitcoin</span>
            <span className="tech-badge">React</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;
