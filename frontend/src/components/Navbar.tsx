import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

interface NavbarProps {
  isConnected: boolean;
  address?: string;
  onConnect: () => void;
  onDisconnect: () => void;
}

function Navbar({ isConnected, address, onConnect, onDisconnect }: NavbarProps) {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🔄</span>
          <span className="brand-text">StackSUSU</span>
        </Link>

        <div className="navbar-links">
          <Link 
            to="/" 
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
          >
            Home
          </Link>
          <Link 
            to="/circles" 
            className={`nav-link ${isActive('/circles') ? 'active' : ''}`}
          >
            Circles
          </Link>
          {isConnected && (
            <Link 
              to="/dashboard" 
              className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
            >
              Dashboard
            </Link>
          )}
        </div>

        <div className="navbar-actions">
          {isConnected ? (
            <div className="wallet-info">
              <div className="wallet-address">
                <span className="wallet-icon">👛</span>
                <span>{truncateAddress(address || '')}</span>
              </div>
              <button onClick={onDisconnect} className="btn-disconnect">
                Disconnect
              </button>
            </div>
          ) : (
            <button onClick={onConnect} className="btn-connect">
              Connect Wallet
            </button>
          )}
        </div>

        <button className="mobile-menu-btn">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
