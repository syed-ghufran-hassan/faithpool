import { useState } from 'react';
import './ContributionForm.css';

interface ContributionFormProps {
  circleId: number;
  contributionAmount: number;
  userBalance: number;
  isLoading?: boolean;
  onSubmit: (amount: number) => Promise<void>;
}

function ContributionForm({
  circleId,
  contributionAmount,
  userBalance,
  isLoading = false,
  onSubmit,
}: ContributionFormProps) {
  const [amount, setAmount] = useState(contributionAmount);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatAmount = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (amount < contributionAmount) {
      setError(`Minimum contribution is ${formatAmount(contributionAmount)} STX`);
      return;
    }

    if (amount > userBalance) {
      setError('Insufficient balance');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(amount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Contribution failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasInsufficientBalance = userBalance < contributionAmount;

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
            onChange={(e) => setAmount(Number(e.target.value))}
            min={contributionAmount}
            step={0.000001}
            disabled={isLoading || isSubmitting || hasInsufficientBalance}
          />
          <button
            type="button"
            className="max-btn"
            onClick={() => setAmount(contributionAmount)}
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
          <span>~0.01 STX</span>
        </div>
        <div className="summary-row total">
          <span>Total</span>
          <span>{formatAmount(amount + 0.01)} STX</span>
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
