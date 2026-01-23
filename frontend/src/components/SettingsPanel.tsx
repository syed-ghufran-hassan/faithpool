import { forwardRef, useState, useCallback, memo } from 'react';
import type { HTMLAttributes } from 'react';
import { 
  User, 
  Bell, 
  Lock, 
  Settings,
  Save,
  RotateCcw,
  X,
  type LucideIcon
} from 'lucide-react';
import clsx from 'clsx';
import { Card } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import { Badge } from './Badge';
import { Alert } from './Alert';
import './SettingsPanel.css';

export interface UserSettings {
  displayName: string;
  email: string;
  notifications: {
    payoutReminders: boolean;
    circleUpdates: boolean;
    nftActivity: boolean;
    marketing: boolean;
  };
  privacy: {
    showBalance: boolean;
    showActivity: boolean;
    showNFTs: boolean;
  };
  theme: 'light' | 'dark' | 'system';
  currency: 'USD' | 'EUR' | 'GBP' | 'BTC';
}

type TabId = 'profile' | 'notifications' | 'privacy' | 'preferences';

interface TabConfig {
  id: TabId;
  label: string;
  icon: LucideIcon;
}

export interface SettingsPanelProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSave'> {
  /** Current settings */
  settings: UserSettings;
  /** Save handler */
  onSave: (settings: UserSettings) => Promise<void>;
  /** Cancel handler */
  onCancel?: () => void;
  /** Loading state */
  isLoading?: boolean;
  /** Default active tab */
  defaultTab?: TabId;
}

const TABS: TabConfig[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy', icon: Lock },
  { id: 'preferences', label: 'Preferences', icon: Settings },
];

export const SettingsPanel = memo(forwardRef<HTMLDivElement, SettingsPanelProps>(
  function SettingsPanel(
    {
      settings: initialSettings,
      onSave,
      onCancel,
      isLoading = false,
      defaultTab = 'profile',
      className,
      ...props
    },
    ref
  ) {
    const [settings, setSettings] = useState<UserSettings>(initialSettings);
    const [activeTab, setActiveTab] = useState<TabId>(defaultTab);
    const [hasChanges, setHasChanges] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const handleChange = useCallback(<K extends keyof UserSettings>(
      key: K,
      value: UserSettings[K]
    ) => {
      setSettings(prev => ({ ...prev, [key]: value }));
      setHasChanges(true);
      setSaveSuccess(false);
    }, []);

    const handleNestedChange = useCallback(<K extends 'notifications' | 'privacy'>(
      category: K,
      key: keyof UserSettings[K],
      value: boolean
    ) => {
      setSettings(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          [key]: value,
        },
      }));
      setHasChanges(true);
      setSaveSuccess(false);
    }, []);

    const handleSave = useCallback(async () => {
      try {
        await onSave(settings);
        setHasChanges(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } catch (error) {
        console.error('Failed to save settings:', error);
      }
    }, [onSave, settings]);

    const handleReset = useCallback(() => {
      setSettings(initialSettings);
      setHasChanges(false);
    }, [initialSettings]);

    return (
      <div
        ref={ref}
        className={clsx('settings-panel', className)}
        {...props}
      >
        {/* Tabs */}
        <div className="settings-panel__tabs" role="tablist">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                className={clsx(
                  'settings-panel__tab',
                  activeTab === tab.id && 'settings-panel__tab--active'
                )}
                onClick={() => setActiveTab(tab.id)}
                type="button"
              >
                <Icon className="settings-panel__tab-icon" size={18} />
                <span className="settings-panel__tab-label">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <Card className="settings-panel__content">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="settings-panel__section">
              <h3>Profile Settings</h3>
              <p className="settings-panel__description">
                Manage your profile information
              </p>

            <div className="settings-panel__field">
              <label>Display Name</label>
              <Input
                placeholder="Enter your display name"
                value={settings.displayName}
                onChange={(e) => handleChange('displayName', e.target.value)}
                maxLength={50}
              />
              <span className="settings-panel__hint">
                This name will be shown to other users
              </span>
            </div>

            <div className="settings-panel__field">
              <label>Email Address</label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={settings.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
              <span className="settings-panel__hint">
                Used for notifications and account recovery
              </span>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="settings-panel__section">
            <h3>Notification Preferences</h3>
            <p className="settings-panel__description">
              Choose what notifications you want to receive
            </p>

            <div className="settings-panel__toggle-list">
              <label className="settings-panel__toggle">
                <div className="settings-panel__toggle-info">
                  <span className="settings-panel__toggle-title">Payout Reminders</span>
                  <span className="settings-panel__toggle-description">
                    Get notified when it's your turn to receive a payout
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.payoutReminders}
                  onChange={(e) => handleNestedChange('notifications', 'payoutReminders', e.target.checked)}
                />
              </label>

              <label className="settings-panel__toggle">
                <div className="settings-panel__toggle-info">
                  <span className="settings-panel__toggle-title">Circle Updates</span>
                  <span className="settings-panel__toggle-description">
                    Notifications about circle activity and member changes
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.circleUpdates}
                  onChange={(e) => handleNestedChange('notifications', 'circleUpdates', e.target.checked)}
                />
              </label>

              <label className="settings-panel__toggle">
                <div className="settings-panel__toggle-info">
                  <span className="settings-panel__toggle-title">NFT Activity</span>
                  <span className="settings-panel__toggle-description">
                    Updates about your NFT listings and sales
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.nftActivity}
                  onChange={(e) => handleNestedChange('notifications', 'nftActivity', e.target.checked)}
                />
              </label>

              <label className="settings-panel__toggle">
                <div className="settings-panel__toggle-info">
                  <span className="settings-panel__toggle-title">Marketing</span>
                  <span className="settings-panel__toggle-description">
                    News, updates, and promotional content
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.marketing}
                  onChange={(e) => handleNestedChange('notifications', 'marketing', e.target.checked)}
                />
              </label>
            </div>
          </div>
        )}

        {/* Privacy Tab */}
        {activeTab === 'privacy' && (
          <div className="settings-panel__section">
            <h3>Privacy Settings</h3>
            <p className="settings-panel__description">
              Control what information is visible to others
            </p>

            <div className="settings-panel__toggle-list">
              <label className="settings-panel__toggle">
                <div className="settings-panel__toggle-info">
                  <span className="settings-panel__toggle-title">Show Balance</span>
                  <span className="settings-panel__toggle-description">
                    Display your STX balance on your public profile
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.privacy.showBalance}
                  onChange={(e) => handleNestedChange('privacy', 'showBalance', e.target.checked)}
                />
              </label>

              <label className="settings-panel__toggle">
                <div className="settings-panel__toggle-info">
                  <span className="settings-panel__toggle-title">Show Activity</span>
                  <span className="settings-panel__toggle-description">
                    Let others see your circle participation history
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.privacy.showActivity}
                  onChange={(e) => handleNestedChange('privacy', 'showActivity', e.target.checked)}
                />
              </label>

              <label className="settings-panel__toggle">
                <div className="settings-panel__toggle-info">
                  <span className="settings-panel__toggle-title">Show NFTs</span>
                  <span className="settings-panel__toggle-description">
                    Display your NFT collection on your profile
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.privacy.showNFTs}
                  onChange={(e) => handleNestedChange('privacy', 'showNFTs', e.target.checked)}
                />
              </label>
            </div>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="settings-panel__section">
            <h3>App Preferences</h3>
            <p className="settings-panel__description">
              Customize your app experience
            </p>

            <div className="settings-panel__field">
              <label>Theme</label>
              <Select
                value={settings.theme}
                onChange={(e) => handleChange('theme', e.target.value as UserSettings['theme'])}
                options={[
                  { value: 'system', label: '🖥️ System Default' },
                  { value: 'light', label: '☀️ Light Mode' },
                  { value: 'dark', label: '🌙 Dark Mode' },
                ]}
              />
            </div>

            <div className="settings-panel__field">
              <label>Display Currency</label>
              <Select
                value={settings.currency}
                onChange={(e) => handleChange('currency', e.target.value as UserSettings['currency'])}
                options={[
                  { value: 'USD', label: '🇺🇸 USD - US Dollar' },
                  { value: 'EUR', label: '🇪🇺 EUR - Euro' },
                  { value: 'GBP', label: '🇬🇧 GBP - British Pound' },
                  { value: 'BTC', label: '₿ BTC - Bitcoin' },
                ]}
              />
              <span className="settings-panel__hint">
                Used for displaying approximate fiat values
              </span>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {saveSuccess && (
          <Alert variant="success" className="settings-panel__alert">
            Settings saved successfully!
          </Alert>
        )}

        {/* Actions */}
        <div className="settings-panel__actions">
          {hasChanges && (
            <Badge variant="warning">Unsaved changes</Badge>
          )}
          <div className="settings-panel__actions-buttons">
            <Button
              variant="ghost"
              onClick={handleReset}
              disabled={!hasChanges || isLoading}
              leftIcon={<RotateCcw size={16} />}
            >
              Reset
            </Button>
            {onCancel && (
              <Button
                variant="secondary"
                onClick={onCancel}
                disabled={isLoading}
                leftIcon={<X size={16} />}
              >
                Cancel
              </Button>
            )}
            <Button
              variant="primary"
              onClick={handleSave}
              loading={isLoading}
              disabled={!hasChanges}
              leftIcon={<Save size={16} />}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
));

export { SettingsPanel as default };
