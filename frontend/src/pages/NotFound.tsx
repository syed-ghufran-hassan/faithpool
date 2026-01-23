import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, AlertCircle } from 'lucide-react';
import { Button } from '../components/Button';
import './NotFound.css';

const NotFound = memo(function NotFound() {
  return (
    <div className="not-found">
      <div className="not-found__content">
        <AlertCircle className="not-found__icon" size={64} />
        <div className="not-found__code">404</div>
        <h1 className="not-found__title">Page Not Found</h1>
        <p className="not-found__text">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="not-found__actions">
          <Button
            as={Link}
            to="/"
            variant="primary"
            leftIcon={<Home size={18} />}
          >
            Go Home
          </Button>
          <Button
            as={Link}
            to="/circles"
            variant="secondary"
            leftIcon={<Search size={18} />}
          >
            Browse Circles
          </Button>
        </div>
      </div>
      
      <div className="not-found__illustration">
        <div className="not-found__circles">
          <div className="not-found__circle not-found__circle--1"></div>
          <div className="not-found__circle not-found__circle--2"></div>
          <div className="not-found__circle not-found__circle--3"></div>
        </div>
      </div>
    </div>
  );
});

export { NotFound as default };
