import { useState } from 'react';
import './Settings.css';

function Settings() {
  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: false,
    darkMode: false,
    language: 'en',
    currency: 'USD',
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSelect = (key: keyof typeof settings, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    // Save settings to localStorage or backend
    localStorage.setItem('stacksusu-settings', JSON.stringify(settings));
    alert('Settings saved!');
  };

  return (
    <div className="settings-page">
      <h1>Settings</h1>

      <div className="settings-sections">
        {/* Notifications */}
        <div className="settings-section">
          <h2>Notifications</h2>
          
          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-name">Push Notifications</span>
              <span className="setting-desc">Receive notifications about circle activity</span>
            </div>
            <button
              className={`toggle ${settings.notifications ? 'active' : ''}`}
              onClick={() => handleToggle('notifications')}
            >
              <span className="toggle-knob" />
            </button>
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-name">Email Alerts</span>
              <span className="setting-desc">Get email updates for important events</span>
            </div>
            <button
              className={`toggle ${settings.emailAlerts ? 'active' : ''}`}
              onClick={() => handleToggle('emailAlerts')}
            >
              <span className="toggle-knob" />
            </button>
          </div>
        </div>

        {/* Appearance */}
        <div className="settings-section">
          <h2>Appearance</h2>
          
          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-name">Dark Mode</span>
              <span className="setting-desc">Use dark theme for the interface</span>
            </div>
            <button
              className={`toggle ${settings.darkMode ? 'active' : ''}`}
              onClick={() => handleToggle('darkMode')}
            >
              <span className="toggle-knob" />
            </button>
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-name">Language</span>
              <span className="setting-desc">Select your preferred language</span>
            </div>
            <select
              value={settings.language}
              onChange={(e) => handleSelect('language', e.target.value)}
              className="setting-select"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
        </div>

        {/* Preferences */}
        <div className="settings-section">
          <h2>Preferences</h2>
          
          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-name">Currency Display</span>
              <span className="setting-desc">Choose how to display currency values</span>
            </div>
            <select
              value={settings.currency}
              onChange={(e) => handleSelect('currency', e.target.value)}
              className="setting-select"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="STX">STX only</option>
            </select>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="settings-section danger">
          <h2>Danger Zone</h2>
          
          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-name">Disconnect Wallet</span>
              <span className="setting-desc">Sign out and disconnect your wallet</span>
            </div>
            <button className="btn btn-danger">Disconnect</button>
          </div>
        </div>
      </div>

      <div className="settings-actions">
        <button className="btn btn-primary" onClick={handleSave}>
          Save Changes
        </button>
      </div>
    </div>
  );
}

export default Settings;
