import './PayoutSchedule.css';

interface PayoutEvent {
  round: number;
  recipientAddress: string;
  amount: number;
  date: string;
  status: 'completed' | 'current' | 'upcoming';
}

interface PayoutScheduleProps {
  payouts: PayoutEvent[];
  currentRound: number;
  currentUserAddress?: string;
}

function PayoutSchedule({ payouts, currentRound, currentUserAddress }: PayoutScheduleProps) {
  const truncateAddress = (address: string) => {
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US').format(amount);
  };

  return (
    <div className="payout-schedule">
      <div className="schedule-timeline">
        {payouts.map((payout, index) => (
          <div
            key={payout.round}
            className={`schedule-item ${payout.status} ${
              payout.recipientAddress === currentUserAddress ? 'is-you' : ''
            }`}
          >
            <div className="timeline-connector">
              <div className="timeline-dot">
                {payout.status === 'completed' && '✓'}
                {payout.status === 'current' && '●'}
              </div>
              {index < payouts.length - 1 && <div className="timeline-line" />}
            </div>
            
            <div className="schedule-content">
              <div className="schedule-header">
                <span className="round-label">Round {payout.round}</span>
                <span className="schedule-date">{payout.date}</span>
              </div>
              <div className="schedule-body">
                <span className="recipient">
                  {truncateAddress(payout.recipientAddress)}
                  {payout.recipientAddress === currentUserAddress && (
                    <span className="you-indicator">Your payout!</span>
                  )}
                </span>
                <span className="payout-amount">{formatAmount(payout.amount)} STX</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PayoutSchedule;
