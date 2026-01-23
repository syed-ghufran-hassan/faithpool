// JoinCircleModal component - Modal to join a circle

import { forwardRef, useState, useCallback, useMemo, memo } from 'react';
import { 
  Users, 
  Coins, 
  User, 
  Wallet, 
  AlertTriangle, 
  UserPlus,
  Info
} from 'lucide-react';
import clsx from 'clsx';
import { useWallet } from '../context/WalletContext';
import { useTransactions } from '../hooks/useTransactions';
import { formatSTX, truncateAddress, isValidStacksAddress } from '../utils/helpers';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import './JoinCircleModal.css';

export interface CircleInfo {
  id: number;
  name: string;
  contribution: number;
  currentMembers: number;
  maxMembers: number;
  creator: string;
}

export interface JoinCircleModalProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Circle to join */
  circle: CircleInfo;
  /** Success callback */
  onSuccess?: () => void;
  /** Optional class name */
  className?: string;
}

export const JoinCircleModal = memo(forwardRef<HTMLDivElement, JoinCircleModalProps>(
  function JoinCircleModal(
    {
      isOpen,
      onClose,
      circle,
      onSuccess,
      className,
    },
    ref
  ) {
    const { isConnected, balance } = useWallet();
    const { submitJoinCircle, isSubmitting } = useTransactions();

    const [referrer, setReferrer] = useState('');
    const [referrerError, setReferrerError] = useState('');
    const [useReferral, setUseReferral] = useState(false);

    const handleReferrerChange = useCallback((value: string) => {
      setReferrer(value);
      if (value && !isValidStacksAddress(value)) {
        setReferrerError('Invalid Stacks address');
      } else {
        setReferrerError('');
      }
    }, []);

    const handleJoin = useCallback(async () => {
      if (!isConnected) return;

      if (useReferral && referrer && !isValidStacksAddress(referrer)) {
        setReferrerError('Invalid Stacks address');
        return;
      }

      const result = await submitJoinCircle({
        circleId: circle.id,
        referrer: useReferral && referrer ? referrer : undefined,
      });

      if (result) {
        onSuccess?.();
        onClose();
      }
    }, [isConnected, useReferral, referrer, submitJoinCircle, circle.id, onSuccess, onClose]);

    const handleReferralToggle = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      setUseReferral(e.target.checked);
    }, []);

    const { slotsRemaining, hasEnoughBalance } = useMemo(() => ({
      slotsRemaining: circle.maxMembers - circle.currentMembers,
      hasEnoughBalance: balance >= circle.contribution,
    }), [circle.maxMembers, circle.currentMembers, balance, circle.contribution]);

    return (
      <Modal 
        isOpen={isOpen} 
        onClose={onClose}
        title={`Join ${circle.name}`}
      >
        <div ref={ref} className={clsx('join-circle-modal', className)}>
          <div className="join-circle-modal__summary">
            <div className="join-circle-modal__summary-item">
              <Coins className="join-circle-modal__summary-icon" size={20} />
              <span className="join-circle-modal__summary-label">Contribution</span>
              <span className="join-circle-modal__summary-value">
                {formatSTX(circle.contribution, 2)}
              </span>
            </div>
            <div className="join-circle-modal__summary-item">
              <Users className="join-circle-modal__summary-icon" size={20} />
              <span className="join-circle-modal__summary-label">Available Slots</span>
              <span className="join-circle-modal__summary-value">
                {slotsRemaining} / {circle.maxMembers}
              </span>
            </div>
            <div className="join-circle-modal__summary-item">
              <User className="join-circle-modal__summary-icon" size={20} />
              <span className="join-circle-modal__summary-label">Created by</span>
              <span className="join-circle-modal__summary-value">
                {truncateAddress(circle.creator)}
              </span>
            </div>
          </div>

          <div className={clsx(
            'join-circle-modal__balance',
            !hasEnoughBalance && 'join-circle-modal__balance--insufficient'
          )}>
            <Wallet size={18} />
            <span className="join-circle-modal__balance-label">Your Balance:</span>
            <span className="join-circle-modal__balance-value">
              {formatSTX(balance, 2)}
            </span>
            {!hasEnoughBalance && (
              <span className="join-circle-modal__balance-warning">
                <AlertTriangle size={14} />
                Insufficient balance. You need at least {formatSTX(circle.contribution, 2)}
              </span>
            )}
          </div>

          <div className="join-circle-modal__referral">
            <label className="join-circle-modal__referral-toggle">
              <input
                type="checkbox"
                checked={useReferral}
                onChange={handleReferralToggle}
              />
              <UserPlus size={16} />
              <span>I have a referral code</span>
            </label>

            {useReferral && (
              <Input
                placeholder="Referrer's Stacks address (SP...)"
                value={referrer}
                onChange={(e) => handleReferrerChange(e.target.value)}
                error={referrerError}
              />
            )}
          </div>

          <div className="join-circle-modal__info">
            <Info className="join-circle-modal__info-icon" size={18} />
            <div>
              <p>
                By joining this circle, you commit to making regular contributions of{' '}
                <strong>{formatSTX(circle.contribution, 2)}</strong> each round.
              </p>
              <p>
                Your payout position will be randomly assigned when the circle starts.
              </p>
            </div>
          </div>

          <div className="join-circle-modal__actions">
            <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleJoin}
              loading={isSubmitting}
              disabled={!isConnected || !hasEnoughBalance || slotsRemaining === 0}
              leftIcon={<UserPlus size={18} />}
            >
              {slotsRemaining === 0 ? 'Circle Full' : 'Join Circle'}
            </Button>
          </div>
        </div>
      </Modal>
    );
  }
));

export { JoinCircleModal as default };
