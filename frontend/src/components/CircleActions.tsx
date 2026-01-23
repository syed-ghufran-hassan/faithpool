// Circle Actions Panel - Action buttons for circle interactions

import { useState } from 'react';
import { Button } from './Button';
import { Modal } from './Modal';
import './CircleActions.css';

interface CircleActionsProps {
  circleId: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  isMember: boolean;
  isCreator: boolean;
  canJoin: boolean;
  canDeposit: boolean;
  canClaimPayout: boolean;
  hasDepositedThisRound: boolean;
  isMyTurnForPayout: boolean;
  contributionAmount: number;
  onJoin: () => Promise<void>;
  onDeposit: () => Promise<void>;
  onClaimPayout: () => Promise<void>;
  onLeave: () => Promise<void>;
  onEmergencyWithdraw: () => Promise<void>;
}

export function CircleActions({
  circleId,
  status,
  isMember,
  isCreator,
  canJoin,
  canDeposit,
  canClaimPayout,
  hasDepositedThisRound,
  isMyTurnForPayout,
  contributionAmount,
  onJoin,
  onDeposit,
  onClaimPayout,
  onLeave,
  onEmergencyWithdraw,
}: CircleActionsProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  const handleAction = async (action: string, fn: () => Promise<void>) => {
    setIsLoading(action);
    try {
      await fn();
    } finally {
      setIsLoading(null);
    }
  };

  const renderMainAction = () => {
    if (status === 'completed') {
      return (
        <div className="action-message completed">
          <span className="message-icon">🎉</span>
          <span>This circle has completed!</span>
        </div>
      );
    }

    if (status === 'cancelled') {
      return (
        <div className="action-message cancelled">
          <span className="message-icon">❌</span>
          <span>This circle was cancelled</span>
        </div>
      );
    }

    if (!isMember && canJoin) {
      return (
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => handleAction('join', onJoin)}
          loading={isLoading === 'join'}
        >
          Join Circle
        </Button>
      );
    }

    if (!isMember) {
      return (
        <div className="action-message">
          <span className="message-icon">🔒</span>
          <span>This circle is full or not accepting members</span>
        </div>
      );
    }

    // Member actions
    if (isMyTurnForPayout && canClaimPayout) {
      return (
        <Button
          variant="success"
          size="lg"
          fullWidth
          onClick={() => handleAction('claim', onClaimPayout)}
          loading={isLoading === 'claim'}
        >
          🎉 Claim Your Payout!
        </Button>
      );
    }

    if (canDeposit && !hasDepositedThisRound) {
      return (
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => handleAction('deposit', onDeposit)}
          loading={isLoading === 'deposit'}
        >
          Deposit {contributionAmount} STX
        </Button>
      );
    }

    if (hasDepositedThisRound) {
      return (
        <div className="action-message deposited">
          <span className="message-icon">✅</span>
          <span>You've deposited this round</span>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="circle-actions">
      <div className="main-action">
        {renderMainAction()}
      </div>

      {isMember && status === 'pending' && (
        <div className="secondary-actions">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowLeaveModal(true)}
          >
            Leave Circle
          </Button>
        </div>
      )}

      {isMember && status === 'active' && (
        <div className="secondary-actions">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowEmergencyModal(true)}
          >
            Emergency Withdraw
          </Button>
        </div>
      )}

      {/* Leave Modal */}
      <Modal
        isOpen={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        title="Leave Circle?"
      >
        <div className="confirm-modal">
          <p>Are you sure you want to leave this circle? Your deposit will be refunded.</p>
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setShowLeaveModal(false)}>
              Cancel
            </Button>
            <Button
              variant="error"
              onClick={() => {
                handleAction('leave', onLeave);
                setShowLeaveModal(false);
              }}
              loading={isLoading === 'leave'}
            >
              Leave Circle
            </Button>
          </div>
        </div>
      </Modal>

      {/* Emergency Withdraw Modal */}
      <Modal
        isOpen={showEmergencyModal}
        onClose={() => setShowEmergencyModal(false)}
        title="⚠️ Emergency Withdraw"
      >
        <div className="confirm-modal warning">
          <p>
            <strong>Warning:</strong> Emergency withdrawal will return your current 
            escrow balance but may incur penalties. This action cannot be undone.
          </p>
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setShowEmergencyModal(false)}>
              Cancel
            </Button>
            <Button
              variant="error"
              onClick={() => {
                handleAction('emergency', onEmergencyWithdraw);
                setShowEmergencyModal(false);
              }}
              loading={isLoading === 'emergency'}
            >
              Emergency Withdraw
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default CircleActions;
