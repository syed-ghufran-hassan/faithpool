import { forwardRef, useState, useMemo, useCallback, memo } from 'react';
import { 
  Coins, 
  Wallet, 
  RefreshCw, 
  ArrowRight, 
  ArrowLeft,
  Info,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import clsx from 'clsx';
import { useWallet } from '../context/WalletContext';
import { useTransactions } from '../hooks/useTransactions';
import { formatSTX, microSTXToSTX, stxToMicroSTX } from '../utils/helpers';
import { validateDepositAmount } from '../utils/validation';
import { Button } from './Button';
import { Input } from './Input';
import { Alert } from './Alert';
import './DepositForm.css';

export interface DepositFormProps {
  /** Circle ID */
  circleId: number;
  /** Required deposit amount in microSTX */
  requiredAmount: number;
  /** Current round number */
  currentRound: number;
  /** Success callback */
  onSuccess?: () => void;
  /** Cancel callback */
  onCancel?: () => void;
  /** Optional class name */
  className?: string;
  /** Display variant */
  variant?: 'default' | 'compact';
  /** Hide cancel button */
  hideCancelButton?: boolean;
}

export const DepositForm = memo(forwardRef<HTMLDivElement, DepositFormProps>(
  function DepositForm(
    {
      circleId,
      requiredAmount,
      currentRound,
      onSuccess,
      onCancel,
      className,
      variant = 'default',
      hideCancelButton = false,
    },
    ref
  ) {
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
    
    const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (value === '' || /^\d*\.?\d{0,6}$/.test(value)) {
        setAmount(value);
        setError(null);
      }
    }, []);
    
    const handleSetExact = useCallback(() => {
      setAmount(microSTXToSTX(requiredAmount).toString());
      setError(null);
    }, [requiredAmount]);
    
    const handleSubmit = useCallback(async () => {
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
    }, [validation, submitDeposit, circleId, amountInMicroSTX, currentRound, onSuccess]);
    
    const balanceAfterDeposit = balance - amountInMicroSTX;
    const isOverpayment = amountInMicroSTX > requiredAmount;
    const underpaymentAmount = requiredAmount - amountInMicroSTX;
    
    if (showConfirm) {
      return (
        <div 
          ref={ref}
          className={clsx(
            'deposit-form',
            `deposit-form--${variant}`,
            'deposit-form--confirm',
            className
          )}
        >
          <h3 className="deposit-form__title">
            <CheckCircle size={20} />
            Confirm Deposit
          </h3>
          
          <div className="deposit-form__summary">
            <div className="deposit-form__summary-row">
              <span>Circle ID</span>
              <span>#{circleId}</span>
            </div>
            <div className="deposit-form__summary-row">
              <span><RefreshCw size={14} /> Round</span>
              <span>{currentRound}</span>
            </div>
            <div className="deposit-form__summary-row deposit-form__summary-row--highlight">
              <span><Coins size={14} /> Deposit Amount</span>
              <span>{formatSTX(amountInMicroSTX)}</span>
            </div>
            <div className="deposit-form__summary-row">
              <span><Wallet size={14} /> Balance After</span>
              <span className={clsx(balanceAfterDeposit < 0 && 'deposit-form__text--error')}>
                {formatSTX(balanceAfterDeposit)}
              </span>
            </div>
          </div>
          
          {isOverpayment && (
            <Alert type="warning" className="deposit-form__alert">
              <AlertTriangle size={16} />
              You're depositing more than required. Extra amount will be held in escrow.
            </Alert>
          )}
          
          <div className="deposit-form__actions">
            <Button
              variant="secondary"
              onClick={() => setShowConfirm(false)}
              disabled={isLoading}
              leftIcon={<ArrowLeft size={16} />}
            >
              Back
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={isLoading}
              leftIcon={<CheckCircle size={16} />}
            >
              Confirm Deposit
            </Button>
          </div>
        </div>
      );
    }
    
    return (
      <div 
        ref={ref}
        className={clsx(
          'deposit-form',
          `deposit-form--${variant}`,
          className
        )}
      >
        <h3 className="deposit-form__title">
          <Coins size={20} />
          Make Deposit
        </h3>
        
        <div className="deposit-form__info">
          <div className="deposit-form__info-row">
            <span><Coins size={14} /> Required Amount</span>
            <span className="deposit-form__info-value">{formatSTX(requiredAmount)}</span>
          </div>
          <div className="deposit-form__info-row">
            <span><Wallet size={14} /> Your Balance</span>
            <span className="deposit-form__info-value">{formatSTX(balance)}</span>
          </div>
          <div className="deposit-form__info-row">
            <span><RefreshCw size={14} /> Current Round</span>
            <span className="deposit-form__info-value">{currentRound}</span>
          </div>
        </div>
        
        <div className="deposit-form__input-group">
          <Input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={handleAmountChange}
            placeholder="0.000000"
            label="Deposit Amount (STX)"
            error={error || (txError ?? undefined)}
            rightElement={
              <button className="deposit-form__exact-btn" onClick={handleSetExact}>
                Exact
              </button>
            }
          />
        </div>
        
        {underpaymentAmount > 0 && amount && (
          <Alert type="info" className="deposit-form__alert">
            <Info size={16} />
            Depositing {formatSTX(underpaymentAmount)} less than required.
          </Alert>
        )}
        
        <div className="deposit-form__actions">
          {onCancel && !hideCancelButton && (
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button
            variant="primary"
            onClick={() => setShowConfirm(true)}
            disabled={!validation.isValid}
            rightIcon={<ArrowRight size={16} />}
          >
            Review Deposit
          </Button>
        </div>
      </div>
    );
  }
));

export { DepositForm as default };
