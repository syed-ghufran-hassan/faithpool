import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { truncateAddress, formatSTX } from '../utils/helpers';
import './Navbar.css';

function Navbar() {
  const location = useLocation();
  const { isConnected, isConnecting, address, balance, connect, disconnect, error } = useWallet();

  const isActive = (path: string) => location.pathname === path;

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
              <div className="wallet-balance">
                <span className="balance-amount">{formatSTX(balance, 2)}</span>
              </div>
              <div className="wallet-address">
                <span className="wallet-icon">👛</span>
                <span>{truncateAddress(address || '')}</span>
              </div>
              <button onClick={disconnect} className="btn-disconnect">
                Disconnect
              </button>
            </div>
          ) : (
            <button 
              onClick={connect} 
              className="btn-connect"
              disabled={isConnecting}
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
          {error && <span className="wallet-error">{error}</span>}
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
