// Circle Actions Panel - Action buttons for circle interactions

import { forwardRef, useState, useCallback, memo } from 'react';
import { 
  UserPlus, 
  Wallet, 
  Gift, 
  LogOut, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Lock,
  PartyPopper,
  Coins
} from 'lucide-react';
import clsx from 'clsx';
import { Button } from './Button';
import { Modal } from './Modal';
import './CircleActions.css';

export type CircleStatus = 'pending' | 'active' | 'completed' | 'cancelled';

export interface CircleActionsProps {
  /** Circle ID */
  circleId: number;
  /** Current circle status */
  status: CircleStatus;
  /** Whether user is a member */
  isMember: boolean;
  /** Whether user is the creator */
  isCreator: boolean;
  /** Whether user can join */
  canJoin: boolean;
  /** Whether user can deposit */
  canDeposit: boolean;
  /** Whether user can claim payout */
  canClaimPayout: boolean;
  /** Whether user has deposited this round */
  hasDepositedThisRound: boolean;
  /** Whether it's user's turn for payout */
  isMyTurnForPayout: boolean;
  /** Contribution amount in STX */
  contributionAmount: number;
  /** Join handler */
  onJoin: () => Promise<void>;
  /** Deposit handler */
  onDeposit: () => Promise<void>;
  /** Claim payout handler */
  onClaimPayout: () => Promise<void>;
  /** Leave handler */
  onLeave: () => Promise<void>;
  /** Emergency withdraw handler */
  onEmergencyWithdraw: () => Promise<void>;
  /** Optional class name */
  className?: string;
  /** Display variant */
  variant?: 'default' | 'compact' | 'inline';
  /** Hide secondary actions */
  hideSecondaryActions?: boolean;
}

export const CircleActions = memo(forwardRef<HTMLDivElement, CircleActionsProps>(
  function CircleActions(
    {
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
      className,
      variant = 'default',
      hideSecondaryActions = false,
    },
    ref
  ) {
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [showEmergencyModal, setShowEmergencyModal] = useState(false);

    const handleAction = useCallback(async (action: string, fn: () => Promise<void>) => {
      setIsLoading(action);
      try {
        await fn();
      } finally {
        setIsLoading(null);
      }
    }, []);

    const renderMainAction = () => {
      if (status === 'completed') {
        return (
          <div className="circle-actions__message circle-actions__message--completed">
            <PartyPopper className="circle-actions__message-icon" />
            <span>This circle has completed!</span>
          </div>
        );
      }

      if (status === 'cancelled') {
        return (
          <div className="circle-actions__message circle-actions__message--cancelled">
            <XCircle className="circle-actions__message-icon" />
            <span>This circle was cancelled</span>
          </div>
        );
      }

      if (!isMember && canJoin) {
        return (
          <Button
            variant="primary"
            size={variant === 'compact' ? 'md' : 'lg'}
            fullWidth={variant !== 'inline'}
            onClick={() => handleAction('join', onJoin)}
            loading={isLoading === 'join'}
            leftIcon={<UserPlus size={18} />}
          >
            Join Circle
          </Button>
        );
      }

      if (!isMember) {
        return (
          <div className="circle-actions__message circle-actions__message--locked">
            <Lock className="circle-actions__message-icon" />
            <span>This circle is full or not accepting members</span>
          </div>
        );
      }

      // Member actions
      if (isMyTurnForPayout && canClaimPayout) {
        return (
          <Button
            variant="success"
            size={variant === 'compact' ? 'md' : 'lg'}
            fullWidth={variant !== 'inline'}
            onClick={() => handleAction('claim', onClaimPayout)}
            loading={isLoading === 'claim'}
            leftIcon={<Gift size={18} />}
            className="circle-actions__claim-btn"
          >
            Claim Your Payout!
          </Button>
        );
      }

      if (canDeposit && !hasDepositedThisRound) {
        return (
          <Button
            variant="primary"
            size={variant === 'compact' ? 'md' : 'lg'}
            fullWidth={variant !== 'inline'}
            onClick={() => handleAction('deposit', onDeposit)}
            loading={isLoading === 'deposit'}
            leftIcon={<Coins size={18} />}
          >
            Deposit {contributionAmount} STX
          </Button>
        );
      }

      if (hasDepositedThisRound) {
        return (
          <div className="circle-actions__message circle-actions__message--deposited">
            <CheckCircle className="circle-actions__message-icon" />
            <span>You've deposited this round</span>
          </div>
        );
      }

      return null;
    };

    const showSecondary = !hideSecondaryActions && isMember;

    return (
      <div 
        ref={ref}
        className={clsx(
          'circle-actions',
          `circle-actions--${variant}`,
          className
        )}
      >
        <div className="circle-actions__main">
          {renderMainAction()}
        </div>

        {showSecondary && status === 'pending' && (
          <div className="circle-actions__secondary">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowLeaveModal(true)}
              leftIcon={<LogOut size={16} />}
            >
              Leave Circle
            </Button>
          </div>
        )}

        {showSecondary && status === 'active' && (
          <div className="circle-actions__secondary">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEmergencyModal(true)}
              leftIcon={<AlertTriangle size={16} />}
              className="circle-actions__emergency-btn"
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
          <div className="circle-actions__confirm">
            <p className="circle-actions__confirm-text">
              Are you sure you want to leave this circle? Your deposit will be refunded.
            </p>
            <div className="circle-actions__confirm-actions">
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
                leftIcon={<LogOut size={16} />}
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
          title="Emergency Withdraw"
        >
          <div className="circle-actions__confirm circle-actions__confirm--warning">
            <div className="circle-actions__warning-banner">
              <AlertTriangle className="circle-actions__warning-icon" />
              <p>
                <strong>Warning:</strong> Emergency withdrawal will return your current 
                escrow balance but may incur penalties. This action cannot be undone.
              </p>
            </div>
            <div className="circle-actions__confirm-actions">
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
                leftIcon={<AlertTriangle size={16} />}
              >
                Emergency Withdraw
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
));

export { CircleActions as default };
