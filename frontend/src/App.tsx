import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Circles from './pages/Circles';
import CreateCircle from './pages/CreateCircle';
import Dashboard from './pages/Dashboard';
import './App.css';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | undefined>();

  const handleConnect = async () => {
    // Simulate wallet connection for demo
    // In production, use @stacks/connect
    setIsConnected(true);
    setAddress('SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N');
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setAddress(undefined);
  };

  return (
    <Router>
      <div className="app">
        <Navbar 
          isConnected={isConnected}
          address={address}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
        />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/circles" element={<Circles />} />
            <Route path="/create" element={<CreateCircle />} />
            <Route path="/dashboard" element={<Dashboard address={address} />} />
          </Routes>
        </main>
        <footer className="footer">
          <div className="footer-content">
            <p>© 2024 StackSUSU. Built on Stacks, secured by Bitcoin.</p>
            <div className="footer-links">
              <a href="https://github.com/AdekumleBamz/Stacksusu" target="_blank" rel="noopener noreferrer">GitHub</a>
              <a href="https://docs.stacks.co" target="_blank" rel="noopener noreferrer">Docs</a>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
