import React from 'react';
import { Info, AlertCircle, CheckCircle, AlertTriangle, LucideIcon } from 'lucide-react';
import './InfoCard.css';

export type InfoCardVariant = 'info' | 'success' | 'warning' | 'error';

export interface InfoCardProps {
  variant?: InfoCardVariant;
  title?: string;
  children: React.ReactNode;
  icon?: LucideIcon;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

const variantConfig: Record<InfoCardVariant, { icon: LucideIcon; className: string }> = {
  info: { icon: Info, className: 'info-card--info' },
  success: { icon: CheckCircle, className: 'info-card--success' },
  warning: { icon: AlertTriangle, className: 'info-card--warning' },
  error: { icon: AlertCircle, className: 'info-card--error' },
};

export function InfoCard({
  variant = 'info',
  title,
  children,
  icon: CustomIcon,
  dismissible = false,
  onDismiss,
  className = '',
}: InfoCardProps) {
  const config = variantConfig[variant];
  const Icon = CustomIcon || config.icon;

  return (
    <div className={`info-card ${config.className} ${className}`} role="alert">
      <Icon className="info-card__icon" />
      <div className="info-card__content">
        {title && <h4 className="info-card__title">{title}</h4>}
        <div className="info-card__body">{children}</div>
      </div>
      {dismissible && (
        <button className="info-card__dismiss" onClick={onDismiss} aria-label="Dismiss">
          ×
        </button>
      )}
    </div>
  );
}

export function TipCard({ children, title = 'Tip' }: { children: React.ReactNode; title?: string }) {
  return <InfoCard variant="info" title={title}>{children}</InfoCard>;
}

export function WarningCard({ children, title = 'Warning' }: { children: React.ReactNode; title?: string }) {
  return <InfoCard variant="warning" title={title}>{children}</InfoCard>;
}

export default InfoCard;
