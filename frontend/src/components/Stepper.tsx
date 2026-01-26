/**
 * Stepper Component
 * 
 * Multi-step progress indicator for wizards, forms, and onboarding flows.
 * Supports horizontal and vertical layouts with customizable styling.
 * 
 * @module components/Stepper
 */

import React from 'react';
import { Check, AlertCircle } from 'lucide-react';
import './Stepper.css';

// =============================================================================
// Types
// =============================================================================

export type StepStatus = 'pending' | 'current' | 'completed' | 'error';

export interface Step {
  /** Unique identifier */
  id: string;
  /** Step title/label */
  title: string;
  /** Optional description */
  description?: string;
  /** Custom icon for the step */
  icon?: React.ReactNode;
  /** Step status (auto-calculated if not provided) */
  status?: StepStatus;
}

export interface StepperProps {
  /** Array of step definitions */
  steps: Step[];
  /** Currently active step index (0-based) */
  currentStep: number;
  /** Layout orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Step size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Allow clicking on completed steps */
  clickable?: boolean;
  /** Callback when a step is clicked */
  onStepClick?: (stepIndex: number) => void;
  /** Show step numbers instead of icons */
  showNumbers?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export interface StepIndicatorProps {
  step: Step;
  index: number;
  status: StepStatus;
  size: 'sm' | 'md' | 'lg';
  showNumbers: boolean;
  clickable: boolean;
  onClick?: () => void;
}

// =============================================================================
// Step Indicator
// =============================================================================

function StepIndicator({
  step,
  index,
  status,
  size,
  showNumbers,
  clickable,
  onClick,
}: StepIndicatorProps) {
  const canClick = clickable && (status === 'completed' || status === 'current');

  const handleClick = () => {
    if (canClick && onClick) {
      onClick();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if ((event.key === 'Enter' || event.key === ' ') && canClick) {
      event.preventDefault();
      onClick?.();
    }
  };

  const renderContent = () => {
    if (status === 'completed') {
      return <Check size={size === 'lg' ? 20 : size === 'md' ? 16 : 14} />;
    }
    if (status === 'error') {
      return <AlertCircle size={size === 'lg' ? 20 : size === 'md' ? 16 : 14} />;
    }
    if (step.icon && !showNumbers) {
      return step.icon;
    }
    return <span>{index + 1}</span>;
  };

  return (
    <div
      role={canClick ? 'button' : undefined}
      tabIndex={canClick ? 0 : undefined}
      className={`stepper__indicator stepper__indicator--${status} stepper__indicator--${size} ${canClick ? 'stepper__indicator--clickable' : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-current={status === 'current' ? 'step' : undefined}
    >
      {renderContent()}
    </div>
  );
}

// =============================================================================
// Stepper Component
// =============================================================================

/**
 * Multi-step progress indicator
 * 
 * @example
 * ```tsx
 * const steps = [
 *   { id: 'details', title: 'Circle Details' },
 *   { id: 'members', title: 'Invite Members' },
 *   { id: 'confirm', title: 'Confirm & Create' },
 * ];
 * 
 * <Stepper 
 *   steps={steps} 
 *   currentStep={1} 
 *   onStepClick={(index) => setCurrentStep(index)}
 *   clickable
 * />
 * ```
 */
export function Stepper({
  steps,
  currentStep,
  orientation = 'horizontal',
  size = 'md',
  clickable = false,
  onStepClick,
  showNumbers = false,
  className = '',
}: StepperProps) {
  const getStepStatus = (index: number, step: Step): StepStatus => {
    if (step.status) return step.status;
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'current';
    return 'pending';
  };

  return (
    <nav
      className={`stepper stepper--${orientation} stepper--${size} ${className}`}
      aria-label="Progress"
    >
      <ol className="stepper__list">
        {steps.map((step, index) => {
          const status = getStepStatus(index, step);
          const isLast = index === steps.length - 1;

          return (
            <li
              key={step.id}
              className={`stepper__step stepper__step--${status}`}
            >
              <div className="stepper__step-content">
                <StepIndicator
                  step={step}
                  index={index}
                  status={status}
                  size={size}
                  showNumbers={showNumbers}
                  clickable={clickable}
                  onClick={() => onStepClick?.(index)}
                />
                <div className="stepper__step-info">
                  <span className="stepper__step-title">{step.title}</span>
                  {step.description && (
                    <span className="stepper__step-description">
                      {step.description}
                    </span>
                  )}
                </div>
              </div>
              {!isLast && (
                <div 
                  className={`stepper__connector ${status === 'completed' ? 'stepper__connector--completed' : ''}`}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Stepper;
