import './Spinner.css';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'gray';
  className?: string;
}

function Spinner({ size = 'md', color = 'primary', className = '' }: SpinnerProps) {
  return (
    <div className={`spinner spinner-${size} spinner-${color} ${className}`}>
      <div className="spinner-circle"></div>
    </div>
  );
}

export default Spinner;
