import { useState, useCallback, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar, Footer, Spinner } from './components';
import './App.css';

// Lazy load pages for better initial bundle size
const Home = lazy(() => import('./pages/Home'));
const Circles = lazy(() => import('./pages/Circles'));
const CreateCircle = lazy(() => import('./pages/CreateCircle'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CircleDetail = lazy(() => import('./pages/CircleDetail'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const About = lazy(() => import('./pages/About'));
const FAQ = lazy(() => import('./pages/FAQ'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Demo address for development
const DEMO_ADDRESS = 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N';

function PageLoader() {
  return (
    <div className="app__loader">
      <Spinner size="lg" />
    </div>
  );
}

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | undefined>();

  const handleConnect = useCallback(async () => {
    // Simulate wallet connection for demo
    // In production, use @stacks/connect
    setIsConnected(true);
    setAddress(DEMO_ADDRESS);
  }, []);

  const handleDisconnect = useCallback(() => {
    setIsConnected(false);
    setAddress(undefined);
  }, []);

  return (
    <Router>
      <div className="app">
        <Navbar 
          isConnected={isConnected}
          address={address}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
        />
        <main className="app__main">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/circles" element={<Circles />} />
              <Route path="/circle/:id" element={<CircleDetail />} />
              <Route path="/create" element={<CreateCircle />} />
              <Route path="/dashboard" element={<Dashboard address={address} />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/about" element={<About />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
