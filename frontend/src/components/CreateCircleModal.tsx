import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import { Alert } from './Alert';
import './CreateCircleModal.css';

interface CreateCircleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (circleData: CircleFormData) => Promise<void>;
  isLoading?: boolean;
  userBalance?: number;
}

export interface CircleFormData {
  name: string;
  maxMembers: number;
  contributionAmount: number;
  payoutFrequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  description?: string;
  isPrivate: boolean;
}

const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
];

const MEMBER_OPTIONS = [
  { value: '5', label: '5 Members' },
  { value: '10', label: '10 Members' },
  { value: '15', label: '15 Members' },
  { value: '20', label: '20 Members' },
];

const MIN_CONTRIBUTION = 1; // 1 STX
const MAX_CONTRIBUTION = 10000; // 10,000 STX

export const CreateCircleModal: React.FC<CreateCircleModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  userBalance = 0,
}) => {
  const [formData, setFormData] = useState<CircleFormData>({
    name: '',
    maxMembers: 10,
    contributionAmount: 10,
    payoutFrequency: 'weekly',
    description: '',
    isPrivate: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CircleFormData, string>>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setFormData({
        name: '',
        maxMembers: 10,
        contributionAmount: 10,
        payoutFrequency: 'weekly',
        description: '',
        isPrivate: false,
      });
      setErrors({});
      setShowAdvanced(false);
    }
  }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CircleFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Circle name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Name must be less than 50 characters';
    }

    if (formData.contributionAmount < MIN_CONTRIBUTION) {
      newErrors.contributionAmount = `Minimum contribution is ${MIN_CONTRIBUTION} STX`;
    } else if (formData.contributionAmount > MAX_CONTRIBUTION) {
      newErrors.contributionAmount = `Maximum contribution is ${MAX_CONTRIBUTION} STX`;
    }

    if (formData.contributionAmount > userBalance / 1_000_000) {
      newErrors.contributionAmount = 'Contribution exceeds your balance';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await onSubmit({
        ...formData,
        contributionAmount: formData.contributionAmount * 1_000_000, // Convert to microSTX
      });
      onClose();
    } catch (error) {
      console.error('Failed to create circle:', error);
    }
  };

  const handleInputChange = (field: keyof CircleFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const totalPoolSize = formData.contributionAmount * formData.maxMembers;
  const estimatedPayout = totalPoolSize - (totalPoolSize * 0.02); // 2% platform fee

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Circle"
      size="medium"
    >
      <div className="create-circle-modal">
        <div className="create-circle-modal__form">
          {/* Circle Name */}
          <div className="create-circle-modal__field">
            <label className="create-circle-modal__label">
              Circle Name
              <span className="create-circle-modal__required">*</span>
            </label>
            <Input
              placeholder="Enter circle name..."
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={errors.name}
              maxLength={50}
            />
            <span className="create-circle-modal__hint">
              {formData.name.length}/50 characters
            </span>
          </div>

          {/* Members & Contribution Row */}
          <div className="create-circle-modal__row">
            <div className="create-circle-modal__field">
              <label className="create-circle-modal__label">Max Members</label>
              <Select
                value={String(formData.maxMembers)}
                onChange={(e) => handleInputChange('maxMembers', parseInt(e.target.value))}
                options={MEMBER_OPTIONS}
              />
            </div>

            <div className="create-circle-modal__field">
              <label className="create-circle-modal__label">
                Contribution (STX)
                <span className="create-circle-modal__required">*</span>
              </label>
              <Input
                type="number"
                placeholder="10"
                value={String(formData.contributionAmount)}
                onChange={(e) => handleInputChange('contributionAmount', parseFloat(e.target.value) || 0)}
                error={errors.contributionAmount}
                min={MIN_CONTRIBUTION}
                max={MAX_CONTRIBUTION}
              />
            </div>
          </div>

          {/* Payout Frequency */}
          <div className="create-circle-modal__field">
            <label className="create-circle-modal__label">Payout Frequency</label>
            <Select
              value={formData.payoutFrequency}
              onChange={(e) => handleInputChange('payoutFrequency', e.target.value as CircleFormData['payoutFrequency'])}
              options={FREQUENCY_OPTIONS}
            />
          </div>

          {/* Advanced Options Toggle */}
          <button
            type="button"
            className="create-circle-modal__advanced-toggle"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <span>{showAdvanced ? 'Hide' : 'Show'} Advanced Options</span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={showAdvanced ? 'rotated' : ''}
            >
              <polyline points="6,9 12,15 18,9" />
            </svg>
          </button>

          {/* Advanced Options */}
          {showAdvanced && (
            <div className="create-circle-modal__advanced">
              <div className="create-circle-modal__field">
                <label className="create-circle-modal__label">Description</label>
                <textarea
                  className="create-circle-modal__textarea"
                  placeholder="Describe your circle..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  maxLength={200}
                  rows={3}
                />
                <span className="create-circle-modal__hint">
                  {(formData.description?.length || 0)}/200 characters
                </span>
              </div>

              <label className="create-circle-modal__checkbox">
                <input
                  type="checkbox"
                  checked={formData.isPrivate}
                  onChange={(e) => handleInputChange('isPrivate', e.target.checked)}
                />
                <span className="create-circle-modal__checkbox-text">
                  <strong>Private Circle</strong>
                  <small>Only invited members can join</small>
                </span>
              </label>
            </div>
          )}

          {/* Summary */}
          <div className="create-circle-modal__summary">
            <h4>Circle Summary</h4>
            <div className="create-circle-modal__summary-grid">
              <div className="create-circle-modal__summary-item">
                <span className="summary-label">Total Pool Size</span>
                <span className="summary-value">{totalPoolSize.toFixed(2)} STX</span>
              </div>
              <div className="create-circle-modal__summary-item">
                <span className="summary-label">Est. Payout</span>
                <span className="summary-value highlight">{estimatedPayout.toFixed(2)} STX</span>
              </div>
              <div className="create-circle-modal__summary-item">
                <span className="summary-label">Platform Fee</span>
                <span className="summary-value">2%</span>
              </div>
              <div className="create-circle-modal__summary-item">
                <span className="summary-label">Payout Schedule</span>
                <span className="summary-value">{formData.payoutFrequency}</span>
              </div>
            </div>
          </div>

          {/* Balance Warning */}
          {formData.contributionAmount > userBalance / 1_000_000 && (
            <Alert variant="warning" className="create-circle-modal__alert">
              Your balance ({(userBalance / 1_000_000).toFixed(2)} STX) is less than the contribution amount.
            </Alert>
          )}
        </div>

        {/* Actions */}
        <div className="create-circle-modal__actions">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={!formData.name.trim() || formData.contributionAmount <= 0}
          >
            Create Circle
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CreateCircleModal;
