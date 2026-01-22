import { Link } from 'react-router-dom';
import './NotFound.css';

function NotFound() {
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <div className="error-code">404</div>
        <h1>Page Not Found</h1>
        <p>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="not-found-actions">
          <Link to="/" className="btn btn-primary">
            Go Home
          </Link>
          <Link to="/circles" className="btn btn-secondary">
            Browse Circles
          </Link>
        </div>
      </div>
      
      <div className="not-found-illustration">
        <div className="floating-circles">
          <div className="circle circle-1"></div>
          <div className="circle circle-2"></div>
          <div className="circle circle-3"></div>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
