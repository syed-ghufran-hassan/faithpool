import React, { useState, useEffect, useCallback } from 'react';
import { Badge } from './Badge';
import { Button } from './Button';
import './CountdownTimer.css';

interface CountdownTimerProps {
  targetDate: Date;
  onComplete?: () => void;
  showDays?: boolean;
  showLabels?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'compact' | 'minimal';
  className?: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  onComplete,
  showDays = true,
  showLabels = true,
  size = 'medium',
  variant = 'default',
  className = '',
}) => {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
  });
  const [isComplete, setIsComplete] = useState(false);

  const calculateTimeRemaining = useCallback((): TimeRemaining => {
    const now = new Date().getTime();
    const target = targetDate.getTime();
    const total = target - now;

    if (total <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    }

    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    const hours = Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((total % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, total };
  }, [targetDate]);

  useEffect(() => {
    const updateTimer = () => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);

      if (remaining.total <= 0 && !isComplete) {
        setIsComplete(true);
        onComplete?.();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [calculateTimeRemaining, isComplete, onComplete]);

  const padNumber = (num: number): string => {
    return num.toString().padStart(2, '0');
  };

  const getUrgencyClass = (): string => {
    const { days, hours } = timeRemaining;
    if (days === 0 && hours < 1) return 'countdown-timer--urgent';
    if (days === 0 && hours < 6) return 'countdown-timer--warning';
    return '';
  };

  if (isComplete) {
    return (
      <div className={`countdown-timer countdown-timer--complete ${className}`}>
        <Badge variant="success">Complete!</Badge>
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <div className={`countdown-timer countdown-timer--minimal countdown-timer--${size} ${getUrgencyClass()} ${className}`}>
        {showDays && timeRemaining.days > 0 && (
          <span>{timeRemaining.days}d </span>
        )}
        <span>
          {padNumber(timeRemaining.hours)}:{padNumber(timeRemaining.minutes)}:{padNumber(timeRemaining.seconds)}
        </span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`countdown-timer countdown-timer--compact countdown-timer--${size} ${getUrgencyClass()} ${className}`}>
        {showDays && (
          <div className="countdown-timer__unit">
            <span className="countdown-timer__value">{timeRemaining.days}</span>
            {showLabels && <span className="countdown-timer__label">d</span>}
          </div>
        )}
        <span className="countdown-timer__separator">:</span>
        <div className="countdown-timer__unit">
          <span className="countdown-timer__value">{padNumber(timeRemaining.hours)}</span>
          {showLabels && <span className="countdown-timer__label">h</span>}
        </div>
        <span className="countdown-timer__separator">:</span>
        <div className="countdown-timer__unit">
          <span className="countdown-timer__value">{padNumber(timeRemaining.minutes)}</span>
          {showLabels && <span className="countdown-timer__label">m</span>}
        </div>
        <span className="countdown-timer__separator">:</span>
        <div className="countdown-timer__unit">
          <span className="countdown-timer__value">{padNumber(timeRemaining.seconds)}</span>
          {showLabels && <span className="countdown-timer__label">s</span>}
        </div>
      </div>
    );
  }

  return (
    <div className={`countdown-timer countdown-timer--default countdown-timer--${size} ${getUrgencyClass()} ${className}`}>
      {showDays && (
        <div className="countdown-timer__block">
          <div className="countdown-timer__number">{padNumber(timeRemaining.days)}</div>
          {showLabels && <div className="countdown-timer__text">Days</div>}
        </div>
      )}
      <div className="countdown-timer__block">
        <div className="countdown-timer__number">{padNumber(timeRemaining.hours)}</div>
        {showLabels && <div className="countdown-timer__text">Hours</div>}
      </div>
      <div className="countdown-timer__block">
        <div className="countdown-timer__number">{padNumber(timeRemaining.minutes)}</div>
        {showLabels && <div className="countdown-timer__text">Minutes</div>}
      </div>
      <div className="countdown-timer__block">
        <div className="countdown-timer__number">{padNumber(timeRemaining.seconds)}</div>
        {showLabels && <div className="countdown-timer__text">Seconds</div>}
      </div>
    </div>
  );
};

export default CountdownTimer;
