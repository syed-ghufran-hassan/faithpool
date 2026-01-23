import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import type { Toast, ToastPosition } from '../context/ToastContext';
import './ToastContainer.css';

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);

  const icons = {
    success: <CheckCircle size={20} />,
    error: <XCircle size={20} />,
    warning: <AlertTriangle size={20} />,
    info: <Info size={20} />,
  };

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 200);
  };

  // Progress bar animation
  useEffect(() => {
    if (!toast.duration || toast.duration <= 0) return;
    
    const interval = 50;
    const decrement = (100 * interval) / toast.duration;
    
    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev - decrement;
        if (next <= 0) {
          clearInterval(timer);
          return 0;
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [toast.duration]);

  return (
    <div
      className={clsx(
        'toast',
        `toast--${toast.type}`,
        { 'toast--exiting': isExiting }
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="toast__icon">{toast.icon || icons[toast.type]}</div>
      
      <div className="toast__content">
        <div className="toast__title">{toast.title}</div>
        {toast.message && (
          <div className="toast__message">{toast.message}</div>
        )}
        {toast.action && (
          <button 
            className="toast__action" 
            onClick={() => {
              toast.action?.onClick();
              handleDismiss();
            }}
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {toast.dismissible !== false && (
        <button
          className="toast__close"
          onClick={handleDismiss}
          aria-label="Dismiss notification"
        >
          <X size={16} />
        </button>
      )}

      {toast.duration && toast.duration > 0 && (
        <div className="toast__progress">
          <div 
            className="toast__progress-bar" 
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
  position?: ToastPosition;
}

function ToastContainer({ 
  toasts, 
  onRemove, 
  position = 'top-right' 
}: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className={clsx('toast-container', `toast-container--${position}`)}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

export { ToastContainer, ToastItem };
export default ToastContainer;