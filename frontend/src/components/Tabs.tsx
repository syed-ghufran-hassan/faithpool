import { forwardRef, createContext, useContext, useId } from 'react';
import type { HTMLAttributes, ReactNode, ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';
import './Tabs.css';

export type TabVariant = 'default' | 'pills' | 'underline' | 'bordered';
export type TabSize = 'sm' | 'md' | 'lg';

// Context for tab state
interface TabContextValue {
  activeTab: string;
  onChange: (tabId: string) => void;
  variant: TabVariant;
  size: TabSize;
}

const TabContext = createContext<TabContextValue | null>(null);

function useTabContext() {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error('Tab components must be used within Tabs');
  }
  return context;
}

// Tab item type for simple usage
export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: ReactNode;
  disabled?: boolean;
}

// Tabs root component
interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  tabs?: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: TabVariant;
  size?: TabSize;
  fullWidth?: boolean;
  children?: ReactNode;
}

const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      tabs,
      activeTab,
      onChange,
      variant = 'default',
      size = 'md',
      fullWidth = false,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const contextValue: TabContextValue = {
      activeTab,
      onChange,
      variant,
      size,
    };

    return (
      <TabContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={clsx(
            'tabs',
            `tabs--${variant}`,
            `tabs--${size}`,
            { 'tabs--full-width': fullWidth },
            className
          )}
          {...props}
        >
          {tabs ? (
            <TabList>
              {tabs.map((tab) => (
                <Tab
                  key={tab.id}
                  value={tab.id}
                  disabled={tab.disabled}
                >
                  {tab.icon && <span className="tab__icon">{tab.icon}</span>}
                  <span className="tab__label">{tab.label}</span>
                  {tab.badge && <span className="tab__badge">{tab.badge}</span>}
                </Tab>
              ))}
            </TabList>
          ) : (
            children
          )}
        </div>
      </TabContext.Provider>
    );
  }
);

Tabs.displayName = 'Tabs';

// Tab list container
interface TabListProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const TabList = forwardRef<HTMLDivElement, TabListProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="tablist"
        className={clsx('tabs__list', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

TabList.displayName = 'TabList';

// Individual tab button
interface TabProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value'> {
  value: string;
  children: ReactNode;
}

const Tab = forwardRef<HTMLButtonElement, TabProps>(
  ({ value, children, disabled, className, ...props }, ref) => {
    const { activeTab, onChange, variant, size } = useTabContext();
    const isActive = activeTab === value;
    const tabId = useId();

    return (
      <button
        ref={ref}
        role="tab"
        id={tabId}
        aria-selected={isActive}
        aria-disabled={disabled}
        disabled={disabled}
        tabIndex={isActive ? 0 : -1}
        className={clsx(
          'tab',
          `tab--${variant}`,
          `tab--${size}`,
          {
            'tab--active': isActive,
            'tab--disabled': disabled,
          },
          className
        )}
        onClick={() => onChange(value)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Tab.displayName = 'Tab';

// Tab panel for content
interface TabPanelProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  activeTab: string;
  children: ReactNode;
  keepMounted?: boolean;
}

const TabPanel = forwardRef<HTMLDivElement, TabPanelProps>(
  ({ value, activeTab, children, keepMounted = false, className, ...props }, ref) => {
    const isActive = activeTab === value;

    if (!isActive && !keepMounted) {
      return null;
    }

    return (
      <div
        ref={ref}
        role="tabpanel"
        hidden={!isActive}
        className={clsx('tab-panel', { 'tab-panel--hidden': !isActive }, className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

TabPanel.displayName = 'TabPanel';

export { Tabs, TabList, Tab, TabPanel };
export type { TabsProps, TabListProps, TabProps, TabPanelProps };
export default Tabs;
