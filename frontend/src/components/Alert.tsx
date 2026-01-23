import { forwardRef, useState } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';
import { 
  Info, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  X
} from 'lucide-react';
import './Alert.css';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';
export type AlertStyle = 'filled' | 'outlined' | 'soft';

interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  variant?: AlertVariant;
  alertStyle?: AlertStyle;
  title?: ReactNode;
  children: ReactNode;
  icon?: ReactNode | false;
  action?: ReactNode;
  dismissible?: boolean;
  onClose?: () => void;
}

const defaultIcons: Record<AlertVariant, ReactNode> = {
  info: <Info size={20} />,
  success: <CheckCircle size={20} />,
  warning: <AlertTriangle size={20} />,
  error: <XCircle size={20} />,
};

const Alert = forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      variant = 'info',
      alertStyle = 'soft',
      title,
      children,
      icon,
      action,
      dismissible = false,
      onClose,
      className,
      ...props
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = useState(true);
    const showClose = dismissible || !!onClose;

    const handleClose = () => {
      setIsVisible(false);
      onClose?.();
    };

    if (!isVisible) return null;

    const iconElement = icon === false ? null : icon || defaultIcons[variant];

    return (
      <div
        ref={ref}
        role="alert"
        className={clsx(
          'alert',
          `alert--${variant}`,
          `alert--${alertStyle}`,
          className
        )}
        {...props}
      >
        {iconElement && (
          <span className="alert__icon">{iconElement}</span>
        )}
        
        <div className="alert__body">
          {title && <div className="alert__title">{title}</div>}
          <div className="alert__message">{children}</div>
        </div>

        {(action || showClose) && (
          <div className="alert__actions">
            {action}
            {showClose && (
              <button
                type="button"
                className="alert__close"
                onClick={handleClose}
                aria-label="Dismiss alert"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}
      </div>
    );
  }
);

Alert.displayName = 'Alert';

export { Alert };
export type { AlertProps };
export default Alert;
