import { memo, useState, useCallback, useMemo } from 'react';
import { 
  Bell, 
  Mail, 
  Moon, 
  Globe, 
  DollarSign, 
  LogOut, 
  Save,
  Shield 
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import './Settings.css';

interface SettingsState {
  notifications: boolean;
  emailAlerts: boolean;
  darkMode: boolean;
  language: string;
  currency: string;
}

interface LanguageOption {
  value: string;
  label: string;
}

interface CurrencyOption {
  value: string;
  label: string;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
];

const CURRENCY_OPTIONS: CurrencyOption[] = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'STX', label: 'STX only' },
];

const DEFAULT_SETTINGS: SettingsState = {
  notifications: true,
  emailAlerts: false,
  darkMode: false,
  language: 'en',
  currency: 'USD',
};

const Settings = memo(function Settings() {
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);

  const handleToggle = useCallback((key: keyof SettingsState) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  const handleSelect = useCallback((key: keyof SettingsState, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const handleSave = useCallback(() => {
    localStorage.setItem('stacksusu-settings', JSON.stringify(settings));
    alert('Settings saved!');
  }, [settings]);

  const toggleButtons = useMemo(() => ({
    notifications: (
      <button
        className={`settings__toggle ${settings.notifications ? 'settings__toggle--active' : ''}`}
        onClick={() => handleToggle('notifications')}
        aria-pressed={settings.notifications}
      >
        <span className="settings__toggle-knob" />
      </button>
    ),
    emailAlerts: (
      <button
        className={`settings__toggle ${settings.emailAlerts ? 'settings__toggle--active' : ''}`}
        onClick={() => handleToggle('emailAlerts')}
        aria-pressed={settings.emailAlerts}
      >
        <span className="settings__toggle-knob" />
      </button>
    ),
    darkMode: (
      <button
        className={`settings__toggle ${settings.darkMode ? 'settings__toggle--active' : ''}`}
        onClick={() => handleToggle('darkMode')}
        aria-pressed={settings.darkMode}
      >
        <span className="settings__toggle-knob" />
      </button>
    ),
  }), [settings.notifications, settings.emailAlerts, settings.darkMode, handleToggle]);

  return (
    <div className="settings">
      <h1 className="settings__title">Settings</h1>

      <div className="settings__sections">
        <Card className="settings__section">
          <div className="settings__section-header">
            <Bell size={20} />
            <h2 className="settings__section-title">Notifications</h2>
          </div>
          
          <div className="settings__row">
            <div className="settings__info">
              <span className="settings__name">Push Notifications</span>
              <span className="settings__desc">Receive notifications about circle activity</span>
            </div>
            {toggleButtons.notifications}
          </div>

          <div className="settings__row">
            <div className="settings__info">
              <Mail size={16} className="settings__row-icon" />
              <div>
                <span className="settings__name">Email Alerts</span>
                <span className="settings__desc">Get email updates for important events</span>
              </div>
            </div>
            {toggleButtons.emailAlerts}
          </div>
        </Card>

        <Card className="settings__section">
          <div className="settings__section-header">
            <Moon size={20} />
            <h2 className="settings__section-title">Appearance</h2>
          </div>
          
          <div className="settings__row">
            <div className="settings__info">
              <span className="settings__name">Dark Mode</span>
              <span className="settings__desc">Use dark theme for the interface</span>
            </div>
            {toggleButtons.darkMode}
          </div>

          <div className="settings__row">
            <div className="settings__info">
              <Globe size={16} className="settings__row-icon" />
              <div>
                <span className="settings__name">Language</span>
                <span className="settings__desc">Select your preferred language</span>
              </div>
            </div>
            <select
              value={settings.language}
              onChange={(e) => handleSelect('language', e.target.value)}
              className="settings__select"
            >
              {LANGUAGE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </Card>

        <Card className="settings__section">
          <div className="settings__section-header">
            <DollarSign size={20} />
            <h2 className="settings__section-title">Preferences</h2>
          </div>
          
          <div className="settings__row">
            <div className="settings__info">
              <span className="settings__name">Currency Display</span>
              <span className="settings__desc">Choose how to display currency values</span>
            </div>
            <select
              value={settings.currency}
              onChange={(e) => handleSelect('currency', e.target.value)}
              className="settings__select"
            >
              {CURRENCY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </Card>

        <Card className="settings__section settings__section--danger">
          <div className="settings__section-header">
            <Shield size={20} />
            <h2 className="settings__section-title">Danger Zone</h2>
          </div>
          
          <div className="settings__row">
            <div className="settings__info">
              <span className="settings__name">Disconnect Wallet</span>
              <span className="settings__desc">Sign out and disconnect your wallet</span>
            </div>
            <Button variant="danger" leftIcon={<LogOut size={16} />}>
              Disconnect
            </Button>
          </div>
        </Card>
      </div>

      <div className="settings__actions">
        <Button 
          variant="primary" 
          onClick={handleSave}
          leftIcon={<Save size={18} />}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
});

export { Settings as default };
