import './Footer.css';

interface FooterProps {
  className?: string;
}

function Footer({ className = '' }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`footer ${className}`}>
      <div className="footer-container">
        <div className="footer-main">
          <div className="footer-brand">
            <h3>StackSusu</h3>
            <p>Decentralized savings circles on Stacks blockchain</p>
          </div>

          <div className="footer-links-grid">
            <div className="footer-column">
              <h4>Product</h4>
              <ul>
                <li><a href="/circles">Browse Circles</a></li>
                <li><a href="/create">Create Circle</a></li>
                <li><a href="/dashboard">Dashboard</a></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Resources</h4>
              <ul>
                <li><a href="/about">About</a></li>
                <li><a href="/faq">FAQ</a></li>
                <li><a href="https://docs.stacks.co" target="_blank" rel="noopener noreferrer">Docs</a></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Community</h4>
              <ul>
                <li><a href="https://github.com/AdekumleBamz/Stacksusu" target="_blank" rel="noopener noreferrer">GitHub</a></li>
                <li><a href="https://discord.gg/stacksusu" target="_blank" rel="noopener noreferrer">Discord</a></li>
                <li><a href="https://twitter.com/stacksusu" target="_blank" rel="noopener noreferrer">Twitter</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {currentYear} StackSusu. Built on Stacks, secured by Bitcoin.</p>
          <div className="footer-legal">
            <a href="/terms">Terms</a>
            <a href="/privacy">Privacy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
