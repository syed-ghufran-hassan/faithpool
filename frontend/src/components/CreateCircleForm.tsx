// CreateCircleForm component - Form to create a new circle

import { forwardRef, useState, useCallback, useMemo, memo } from 'react';
import type { FormHTMLAttributes } from 'react';
import { 
  Users, 
  Calendar, 
  Coins,
  FileText,
  Info,
  AlertCircle
} from 'lucide-react';
import clsx from 'clsx';
import { useWallet } from '../context/WalletContext';
import { useTransactions } from '../hooks/useTransactions';
import { 
  validate, 
  circleName, 
  contributionAmount, 
  maxMembers, 
  payoutInterval,
  getFirstError,
} from '../utils/validation';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import './CreateCircleForm.css';

export interface CreateCircleFormData {
  name: string;
  contribution: string;
  maxMembers: string;
  payoutIntervalDays: string;
}

export interface CreateCircleFormProps extends Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  /** Success callback with optional circleId */
  onSuccess?: (circleId?: number) => void;
  /** Cancel callback */
  onCancel?: () => void;
  /** Initial form data */
  initialData?: Partial<CreateCircleFormData>;
  /** Compact mode */
  compact?: boolean;
}

const FREQUENCY_OPTIONS = [
  { value: '7', label: 'Weekly (7 days)' },
  { value: '14', label: 'Bi-weekly (14 days)' },
  { value: '30', label: 'Monthly (30 days)' },
];

const MEMBER_OPTIONS = [
  { value: '3', label: '3 members' },
  { value: '5', label: '5 members' },
  { value: '7', label: '7 members' },
  { value: '10', label: '10 members' },
  { value: '12', label: '12 members' },
  { value: '15', label: '15 members' },
  { value: '20', label: '20 members' },
];

const DEFAULT_FORM_DATA: CreateCircleFormData = {
  name: '',
  contribution: '',
  maxMembers: '5',
  payoutIntervalDays: '7',
};

export const CreateCircleForm = memo(forwardRef<HTMLFormElement, CreateCircleFormProps>(
  function CreateCircleForm(
    {
      onSuccess,
      onCancel,
      initialData,
      compact = false,
      className,
      ...props
    },
    ref
  ) {
    const { isConnected } = useWallet();
    const { submitCreateCircle, isSubmitting } = useTransactions();

    const [formData, setFormData] = useState<CreateCircleFormData>({
      ...DEFAULT_FORM_DATA,
      ...initialData,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const handleChange = useCallback((field: keyof CreateCircleFormData, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      
      // Clear error when user starts typing
      setErrors(prev => prev[field] ? { ...prev, [field]: '' } : prev);
    }, []);

    const validateField = useCallback((field: keyof CreateCircleFormData, value: string) => {
      let rules;
      switch (field) {
        case 'name':
          rules = circleName();
          break;
        case 'contribution':
          rules = contributionAmount();
          break;
        case 'maxMembers':
          rules = maxMembers();
          break;
        case 'payoutIntervalDays':
          rules = payoutInterval();
          break;
        default:
          return '';
      }

      const result = validate(value, rules);
      return getFirstError(result) || '';
    }, []);

    const handleBlur = useCallback((field: keyof CreateCircleFormData) => {
      setTouched(prev => ({ ...prev, [field]: true }));
      const error = validateField(field, formData[field]);
      setErrors(prev => ({ ...prev, [field]: error }));
    }, [formData, validateField]);

    const validateAll = useCallback((): boolean => {
      const newErrors: Record<string, string> = {};
      
      (Object.keys(formData) as Array<keyof CreateCircleFormData>).forEach(field => {
        const error = validateField(field, formData[field]);
        if (error) newErrors[field] = error;
      });

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }, [formData, validateField]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
      e.preventDefault();

      if (!isConnected) {
        setErrors({ submit: 'Please connect your wallet first' });
        return;
      }

      if (!validateAll()) {
        return;
      }

      const result = await submitCreateCircle({
        name: formData.name,
        contribution: parseFloat(formData.contribution),
        maxMembers: parseInt(formData.maxMembers),
        payoutIntervalDays: parseInt(formData.payoutIntervalDays),
      });

      if (result) {
        onSuccess?.();
      }
    }, [isConnected, validateAll, submitCreateCircle, formData, onSuccess]);

    const summary = useMemo(() => {
      const contribution = parseFloat(formData.contribution || '0');
      const members = parseInt(formData.maxMembers || '0');
      const interval = parseInt(formData.payoutIntervalDays || '0');
      
      return {
        totalPayout: (contribution * members).toFixed(2),
        duration: members * interval,
        contribution: formData.contribution || '0',
      };
    }, [formData.contribution, formData.maxMembers, formData.payoutIntervalDays]);

    return (
      <form
        ref={ref}
        className={clsx(
          'create-circle-form',
          compact && 'create-circle-form--compact',
          className
        )}
        onSubmit={handleSubmit}
        {...props}
      >
        <div className="create-circle-form__section">
          <h3 className="create-circle-form__section-title">
            <FileText size={18} />
            Circle Details
          </h3>
          
          <Input
            label="Circle Name"
            placeholder="e.g., Bitcoin Savers Club"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            onBlur={() => handleBlur('name')}
            error={touched.name ? errors.name : undefined}
            maxLength={50}
            leftIcon={<FileText size={18} />}
          />

          <Input
            label="Contribution Amount (STX)"
            type="number"
            placeholder="e.g., 10"
            value={formData.contribution}
            onChange={(e) => handleChange('contribution', e.target.value)}
            onBlur={() => handleBlur('contribution')}
            error={touched.contribution ? errors.contribution : undefined}
            min={0.1}
            step={0.1}
            leftIcon={<Coins size={18} />}
          />
        </div>

        <div className="create-circle-form__section">
          <h3 className="create-circle-form__section-title">
            <Users size={18} />
            Circle Settings
          </h3>

          <Select
            label="Maximum Members"
            value={formData.maxMembers}
            onChange={(e) => handleChange('maxMembers', e.target.value)}
            options={MEMBER_OPTIONS}
          />

          <Select
            label="Payout Frequency"
            value={formData.payoutIntervalDays}
            onChange={(e) => handleChange('payoutIntervalDays', e.target.value)}
            options={FREQUENCY_OPTIONS}
          />
        </div>

        <div className="create-circle-form__summary">
          <h4 className="create-circle-form__summary-title">
            <Info size={16} />
            Summary
          </h4>
          <div className="create-circle-form__summary-row">
            <span>Each member contributes</span>
            <span className="create-circle-form__summary-value">
              {summary.contribution} STX
            </span>
          </div>
          <div className="create-circle-form__summary-row">
            <span>Total payout per round</span>
            <span className="create-circle-form__summary-value">
              {summary.totalPayout} STX
            </span>
          </div>
          <div className="create-circle-form__summary-row">
            <span>Circle duration</span>
            <span className="create-circle-form__summary-value">
              {summary.duration} days
            </span>
          </div>
        </div>

        {errors.submit && (
          <div className="create-circle-form__error">
            <AlertCircle size={16} />
            {errors.submit}
          </div>
        )}

        <div className="create-circle-form__actions">
          {onCancel && (
            <Button 
              type="button" 
              variant="secondary" 
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button 
            type="submit" 
            variant="primary"
            loading={isSubmitting}
            disabled={!isConnected}
          >
            {isConnected ? 'Create Circle' : 'Connect Wallet'}
          </Button>
        </div>
      </form>
    );
  }
));

export { CreateCircleForm as default };
