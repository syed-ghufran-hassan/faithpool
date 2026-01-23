// PayoutTimeline component - Visual payout schedule

import { useBlockchain } from '../hooks/useBlockchain';
import { truncateAddress } from '../utils/helpers';
import Avatar from './Avatar';
import './PayoutTimeline.css';

interface PayoutSlot {
  slot: number;
  address: string;
  isPast: boolean;
  isCurrent: boolean;
  isFuture: boolean;
  payoutBlock?: number;
}

interface PayoutTimelineProps {
  members: { address: string; slot: number }[];
  currentRound: number;
  payoutInterval: number;
  startBlock: number;
  userAddress?: string | null;
}

export function PayoutTimeline({
  members,
  currentRound,
  payoutInterval,
  startBlock,
  userAddress,
}: PayoutTimelineProps) {
  const { currentBlock, timeUntil } = useBlockchain();

  // Sort members by slot
  const sortedMembers = [...members].sort((a, b) => a.slot - b.slot);

  // Build payout slots
  const slots: PayoutSlot[] = sortedMembers.map((member) => {
    const payoutBlock = startBlock + (member.slot * payoutInterval);
    return {
      slot: member.slot,
      address: member.address,
      isPast: member.slot < currentRound,
      isCurrent: member.slot === currentRound,
      isFuture: member.slot > currentRound,
      payoutBlock,
    };
  });

  return (
    <div className="payout-timeline">
      <h4 className="timeline-title">Payout Schedule</h4>
      
      <div className="timeline-track">
        {slots.map((slot, index) => {
          const isUser = slot.address === userAddress;
          
          return (
            <div 
              key={slot.slot}
              className={`timeline-slot ${slot.isPast ? 'past' : ''} ${slot.isCurrent ? 'current' : ''} ${slot.isFuture ? 'future' : ''} ${isUser ? 'is-user' : ''}`}
            >
              <div className="slot-connector">
                {index > 0 && <div className="connector-line" />}
              </div>
              
              <div className="slot-node">
                <Avatar address={slot.address} size="sm" />
                {slot.isCurrent && (
                  <span className="current-indicator" />
                )}
              </div>
              
              <div className="slot-info">
                <span className="slot-address">
                  {truncateAddress(slot.address)}
                  {isUser && <span className="user-tag">You</span>}
                </span>
                <span className="slot-round">Round {slot.slot}</span>
                {slot.isCurrent && slot.payoutBlock && (
                  <span className="slot-time">
                    {currentBlock >= slot.payoutBlock 
                      ? 'Ready to claim'
                      : `~${timeUntil(slot.payoutBlock)}`
                    }
                  </span>
                )}
                {slot.isPast && (
                  <span className="slot-status completed">Completed ✓</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Compact horizontal version
export function PayoutTimelineCompact({
  totalRounds,
  currentRound,
  userSlot,
}: {
  totalRounds: number;
  currentRound: number;
  userSlot?: number;
}) {
  return (
    <div className="payout-timeline-compact">
      <div className="compact-track">
        {Array.from({ length: totalRounds }, (_, i) => {
          const round = i + 1;
          const isPast = round < currentRound;
          const isCurrent = round === currentRound;
          const isUser = round === userSlot;
          
          return (
            <div 
              key={round}
              className={`compact-dot ${isPast ? 'past' : ''} ${isCurrent ? 'current' : ''} ${isUser ? 'is-user' : ''}`}
              title={`Round ${round}${isUser ? ' (You)' : ''}`}
            >
              {isUser && <span className="user-marker">★</span>}
            </div>
          );
        })}
      </div>
      <div className="compact-label">
        Round {currentRound} of {totalRounds}
      </div>
    </div>
  );
}

export default PayoutTimeline;
