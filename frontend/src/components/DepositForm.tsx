import React, { useState, useMemo } from 'react';
import { useWallet } from '../context/WalletContext';
import { useTransactions } from '../hooks/useTransactions';
import { formatSTX, microSTXToSTX, stxToMicroSTX } from '../utils/helpers';
import { validateDepositAmount } from '../utils/validation';
import { Button } from './Button';
import { Input } from './Input';
import { Alert } from './Alert';
import './DepositForm.css';

interface DepositFormProps {
  circleId: number;
  requiredAmount: number;
  currentRound: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const DepositForm: React.FC<DepositFormProps> = ({
  circleId,
  requiredAmount,
  currentRound,
  onSuccess,
  onCancel
}) => {
  const { balance } = useWallet();
  const { submitDeposit, isLoading, error: txError } = useTransactions();
  
  const [amount, setAmount] = useState<string>(microSTXToSTX(requiredAmount).toString());
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const amountInMicroSTX = useMemo(() => {
    const num = parseFloat(amount);
    return isNaN(num) ? 0 : stxToMicroSTX(num);
  }, [amount]);
  
  const validation = useMemo(() => {
    if (!amount || parseFloat(amount) === 0) {
      return { isValid: false, error: 'Enter deposit amount' };
    }
    return validateDepositAmount(amountInMicroSTX, requiredAmount, balance);
  }, [amount, amountInMicroSTX, requiredAmount, balance]);
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d{0,6}$/.test(value)) {
      setAmount(value);
      setError(null);
    }
  };
  
  const handleSetExact = () => {
    setAmount(microSTXToSTX(requiredAmount).toString());
    setError(null);
  };
  
  const handleSubmit = async () => {
    if (!validation.isValid) {
      setError(validation.error || 'Invalid amount');
      return;
    }
    
    try {
      const result = await submitDeposit({
        circleId,
        amount: amountInMicroSTX,
        round: currentRound
      });
      
      if (result.success) {
        onSuccess?.();
      } else {
        setError(result.error || 'Deposit failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };
  
  const balanceAfterDeposit = balance - amountInMicroSTX;
  const isOverpayment = amountInMicroSTX > requiredAmount;
  const underpaymentAmount = requiredAmount - amountInMicroSTX;
  
  if (showConfirm) {
    return (
      <div className="deposit-form">
        <h3 className="deposit-title">Confirm Deposit</h3>
        
        <div className="deposit-summary">
          <div className="summary-row">
            <span>Circle ID</span>
            <span>#{circleId}</span>
          </div>
          <div className="summary-row">
            <span>Round</span>
            <span>{currentRound}</span>
          </div>
          <div className="summary-row highlight">
            <span>Deposit Amount</span>
            <span>{formatSTX(amountInMicroSTX)}</span>
          </div>
          <div className="summary-row">
            <span>Balance After</span>
            <span className={balanceAfterDeposit < 0 ? 'text-error' : ''}>
              {formatSTX(balanceAfterDeposit)}
            </span>
          </div>
        </div>
        
        {isOverpayment && (
          <Alert type="warning" className="mt-4">
            You're depositing more than required. Extra amount will be held in escrow.
          </Alert>
        )}
        
        <div className="deposit-actions">
          <Button
            variant="secondary"
            onClick={() => setShowConfirm(false)}
            disabled={isLoading}
          >
            Back
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={isLoading}
          >
            Confirm Deposit
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="deposit-form">
      <h3 className="deposit-title">Make Deposit</h3>
      
      <div className="deposit-info">
        <div className="info-row">
          <span>Required Amount</span>
          <span className="info-value">{formatSTX(requiredAmount)}</span>
        </div>
        <div className="info-row">
          <span>Your Balance</span>
          <span className="info-value">{formatSTX(balance)}</span>
        </div>
        <div className="info-row">
          <span>Current Round</span>
          <span className="info-value">{currentRound}</span>
        </div>
      </div>
      
      <div className="deposit-input-group">
        <Input
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={handleAmountChange}
          placeholder="0.000000"
          label="Deposit Amount (STX)"
          error={error || (txError ?? undefined)}
          rightElement={
            <button className="exact-btn" onClick={handleSetExact}>
              Exact
            </button>
          }
        />
      </div>
      
      {underpaymentAmount > 0 && amount && (
        <Alert type="info" className="mt-4">
          Depositing {formatSTX(underpaymentAmount)} less than required.
        </Alert>
      )}
      
      <div className="deposit-actions">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          variant="primary"
          onClick={() => setShowConfirm(true)}
          disabled={!validation.isValid}
        >
          Review Deposit
        </Button>
      </div>
    </div>
  );
};

export default DepositForm;
