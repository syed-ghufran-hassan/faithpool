// JoinCircleModal component - Modal to join a circle

import { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { useTransactions } from '../hooks/useTransactions';
import { formatSTX, truncateAddress, isValidStacksAddress } from '../utils/helpers';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';
import './JoinCircleModal.css';

interface CircleInfo {
  id: number;
  name: string;
  contribution: number;
  currentMembers: number;
  maxMembers: number;
  creator: string;
}

interface JoinCircleModalProps {
  isOpen: boolean;
  onClose: () => void;
  circle: CircleInfo;
  onSuccess?: () => void;
}

export function JoinCircleModal({
  isOpen,
  onClose,
  circle,
  onSuccess,
}: JoinCircleModalProps) {
  const { isConnected, balance } = useWallet();
  const { submitJoinCircle, isSubmitting } = useTransactions();

  const [referrer, setReferrer] = useState('');
  const [referrerError, setReferrerError] = useState('');
  const [useReferral, setUseReferral] = useState(false);

  const handleReferrerChange = (value: string) => {
    setReferrer(value);
    if (value && !isValidStacksAddress(value)) {
      setReferrerError('Invalid Stacks address');
    } else {
      setReferrerError('');
    }
  };

  const handleJoin = async () => {
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
  };

  const slotsRemaining = circle.maxMembers - circle.currentMembers;
  const hasEnoughBalance = balance >= circle.contribution;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title={`Join ${circle.name}`}
    >
      <div className="join-circle-modal">
        <div className="circle-summary">
          <div className="summary-item">
            <span className="summary-label">Contribution</span>
            <span className="summary-value">{formatSTX(circle.contribution, 2)}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Available Slots</span>
            <span className="summary-value">{slotsRemaining} / {circle.maxMembers}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Created by</span>
            <span className="summary-value">{truncateAddress(circle.creator)}</span>
          </div>
        </div>

        <div className="balance-check">
          <span className="balance-label">Your Balance:</span>
          <span className={`balance-value ${hasEnoughBalance ? '' : 'insufficient'}`}>
            {formatSTX(balance, 2)}
          </span>
          {!hasEnoughBalance && (
            <span className="balance-warning">
              Insufficient balance. You need at least {formatSTX(circle.contribution, 2)}
            </span>
          )}
        </div>

        <div className="referral-section">
          <label className="referral-toggle">
            <input
              type="checkbox"
              checked={useReferral}
              onChange={(e) => setUseReferral(e.target.checked)}
            />
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

        <div className="join-info">
          <p>
            By joining this circle, you commit to making regular contributions of{' '}
            <strong>{formatSTX(circle.contribution, 2)}</strong> each round.
          </p>
          <p>
            Your payout position will be randomly assigned when the circle starts.
          </p>
        </div>

        <div className="modal-actions">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleJoin}
            loading={isSubmitting}
            disabled={!isConnected || !hasEnoughBalance || slotsRemaining === 0}
          >
            {slotsRemaining === 0 ? 'Circle Full' : 'Join Circle'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default JoinCircleModal;
