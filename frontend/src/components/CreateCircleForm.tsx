// CreateCircleForm component - Form to create a new circle

import { useState } from 'react';
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
import Button from './Button';
import Input from './Input';
import Select from './Select';
import './CreateCircleForm.css';

interface CreateCircleFormProps {
  onSuccess?: (circleId?: number) => void;
  onCancel?: () => void;
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

export function CreateCircleForm({ onSuccess, onCancel }: CreateCircleFormProps) {
  const { isConnected, address } = useWallet();
  const { submitCreateCircle, isSubmitting } = useTransactions();

  const [formData, setFormData] = useState({
    name: '',
    contribution: '',
    maxMembers: '5',
    payoutIntervalDays: '7',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const validateField = (field: string) => {
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
        return;
    }

    const result = validate(formData[field as keyof typeof formData], rules);
    setErrors(prev => ({
      ...prev,
      [field]: getFirstError(result) || '',
    }));
  };

  const validateAll = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    const nameResult = validate(formData.name, circleName());
    if (!nameResult.isValid) newErrors.name = getFirstError(nameResult) || '';

    const contributionResult = validate(formData.contribution, contributionAmount());
    if (!contributionResult.isValid) newErrors.contribution = getFirstError(contributionResult) || '';

    const membersResult = validate(formData.maxMembers, maxMembers());
    if (!membersResult.isValid) newErrors.maxMembers = getFirstError(membersResult) || '';

    const intervalResult = validate(formData.payoutIntervalDays, payoutInterval());
    if (!intervalResult.isValid) newErrors.payoutIntervalDays = getFirstError(intervalResult) || '';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
  };

  const totalPayout = parseFloat(formData.contribution || '0') * parseInt(formData.maxMembers || '0');

  return (
    <form className="create-circle-form" onSubmit={handleSubmit}>
      <div className="form-section">
        <h3 className="form-section-title">Circle Details</h3>
        
        <Input
          label="Circle Name"
          placeholder="e.g., Bitcoin Savers Club"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          onBlur={() => handleBlur('name')}
          error={touched.name ? errors.name : undefined}
          maxLength={50}
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
        />
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Circle Settings</h3>

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

      <div className="form-summary">
        <h4 className="summary-title">Summary</h4>
        <div className="summary-row">
          <span>Each member contributes</span>
          <span className="summary-value">{formData.contribution || '0'} STX</span>
        </div>
        <div className="summary-row">
          <span>Total payout per round</span>
          <span className="summary-value">{totalPayout.toFixed(2)} STX</span>
        </div>
        <div className="summary-row">
          <span>Circle duration</span>
          <span className="summary-value">
            {parseInt(formData.maxMembers) * parseInt(formData.payoutIntervalDays)} days
          </span>
        </div>
      </div>

      {errors.submit && (
        <div className="form-error">{errors.submit}</div>
      )}

      <div className="form-actions">
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

export default CreateCircleForm;
