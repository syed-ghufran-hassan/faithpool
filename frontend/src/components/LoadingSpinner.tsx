import React from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  text?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color,
  text,
  fullScreen = false,
}) => {
  const sizeMap = {
    small: 24,
    medium: 40,
    large: 64,
  };

  const spinnerSize = sizeMap[size];

  const spinnerStyle: React.CSSProperties = {
    width: spinnerSize,
    height: spinnerSize,
    ...(color && { borderTopColor: color, borderRightColor: color }),
  };

  const content = (
    <div className={`loading-spinner loading-spinner--${size}`}>
      <div className="loading-spinner__circle" style={spinnerStyle} />
      {text && <p className="loading-spinner__text">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return <div className="loading-spinner__overlay">{content}</div>;
  }

  return content;
};

export default LoadingSpinner;
