/**
 * ContributionForm Component
 * 
 * Form for making contributions to a savings circle with
 * validation, balance checking, and transaction feedback.
 * 
 * @module features/circles/ContributionForm
 */
import { useState, useCallback, useMemo } from 'react';
import './ContributionForm.css';

// ============================================================================
// Types
// ============================================================================

/** Props for the ContributionForm component */
interface ContributionFormProps {
  /** Circle identifier */
  circleId: number;
  /** Required contribution amount in STX */
  contributionAmount: number;
  /** User's current STX balance */
  userBalance: number;
  /** External loading state */
  isLoading?: boolean;
  /** Callback when contribution is submitted */
  onSubmit: (amount: number) => Promise<void>;
}

// ============================================================================
// Constants
// ============================================================================

/** Estimated network fee for contribution transaction */
const ESTIMATED_NETWORK_FEE = 0.01;

/** Minimum step for STX amount input */
const STX_INPUT_STEP = 0.000001;

// ============================================================================
// Helpers
// ============================================================================

/** Format number with locale-specific thousands separators */
const formatAmount = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

// ============================================================================
// Component
// ============================================================================

/**
 * Contribution form component with validation
 * 
 * @param props - ContributionFormProps
 * @returns Form with amount input and submit button
 */
function ContributionForm({
  contributionAmount,
  userBalance,
  isLoading = false,
  onSubmit,
}: ContributionFormProps) {
  // Form state
  const [amount, setAmount] = useState(contributionAmount);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Derived state
  const hasInsufficientBalance = useMemo(
    () => userBalance < contributionAmount,
    [userBalance, contributionAmount]
  );

  const totalAmount = useMemo(
    () => amount + ESTIMATED_NETWORK_FEE,
    [amount]
  );

  const isDisabled = isLoading || isSubmitting || hasInsufficientBalance;

  // Handlers
  const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(Number(e.target.value));
  }, []);

  const handleSetRequired = useCallback(() => {
    setAmount(contributionAmount);
  }, [contributionAmount]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (amount < contributionAmount) {
      setError(`Minimum contribution is ${formatAmount(contributionAmount)} STX`);
      return;
    }

    if (amount > userBalance) {
      setError('Insufficient balance');
      return;
    }

    // Submit
    setIsSubmitting(true);
    try {
      await onSubmit(amount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Contribution failed');
    } finally {
      setIsSubmitting(false);
    }
  }, [amount, contributionAmount, userBalance, onSubmit]);

  return (
    <form className="contribution-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <h3>Make Contribution</h3>
        <span className="balance">
          Balance: <strong>{formatAmount(userBalance)} STX</strong>
        </span>
      </div>

      <div className="amount-input-wrapper">
        <label htmlFor="contribution-amount">Amount (STX)</label>
        <div className="amount-input">
          <input
            type="number"
            id="contribution-amount"
            value={amount}
            onChange={handleAmountChange}
            min={contributionAmount}
            step={STX_INPUT_STEP}
            disabled={isDisabled}
          />
          <button
            type="button"
            className="max-btn"
            onClick={handleSetRequired}
            disabled={isLoading || isSubmitting}
          >
            Required
          </button>
        </div>
        <span className="hint">
          Required: {formatAmount(contributionAmount)} STX
        </span>
      </div>

      {error && <div className="form-error">{error}</div>}

      {hasInsufficientBalance && (
        <div className="insufficient-warning">
          <span className="warning-icon">⚠️</span>
          <span>Insufficient balance to make contribution</span>
        </div>
      )}

      <div className="form-summary">
        <div className="summary-row">
          <span>Contribution</span>
          <span>{formatAmount(amount)} STX</span>
        </div>
        <div className="summary-row">
          <span>Network Fee (est.)</span>
          <span>~{ESTIMATED_NETWORK_FEE} STX</span>
        </div>
        <div className="summary-row total">
          <span>Total</span>
          <span>{formatAmount(totalAmount)} STX</span>
        </div>
      </div>

      <button
        type="submit"
        className="submit-btn"
        disabled={isLoading || isSubmitting || hasInsufficientBalance}
      >
        {isSubmitting ? (
          <>
            <span className="spinner" />
            Processing...
          </>
        ) : (
          'Contribute'
        )}
      </button>
    </form>
  );
}

export default ContributionForm;
