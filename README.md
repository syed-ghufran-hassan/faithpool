# FaithPool

Community-powered savings circles on Stacks. FaithPool brings traditional rotating savings groups (ROSCA) on-chain with transparent rules, automated payouts, and built-in reputation tracking.

## The Vision

FaithPool modernizes the ancient practice of community savings circles. Friends, families, and communities pool resources together, taking turns receiving the collective pot, building trust and wealth together.

## Why FaithPool

- **Trustless**: Smart contracts enforce the rules fairly
- **Transparent**: Every contribution and payout is on-chain
- **Reputation**: Build on-chain credit through participation
- **Global**: Anyone, anywhere can join or create a circle

## How It Works

```
Week 1: 10 members contribute $100 each → Member A receives $1000
Week 2: 10 members contribute $100 each → Member B receives $1000
...
Week 10: 10 members contribute $100 each → Member J receives $1000
```

## Architecture

```
faithpool/
├── contracts/                    # Clarity smart contracts
│   ├── core.clar                 # Circle creation & management
│   ├── escrow.clar               # Contribution escrow
│   ├── reputation.clar           # Member reputation scoring
│   ├── governance.clar           # Circle voting & disputes
│   └── nft-badges.clar           # Achievement NFTs
├── frontend/                     # React + Vite dashboard
│   ├── components/               # UI components
│   ├── hooks/                    # Blockchain interactions
│   ├── utils/                    # Helper utilities
│   └── pages/                    # Application pages
└── docs/                         # Documentation
```

## Features

### Circle Management
- Create circles with custom parameters
- Set contribution amounts and frequency
- Invite members via links
- Public and private circles

### Contribution System
- Automated reminders
- Escrow protection
- Late penalty configuration
- Grace periods

### Payout Schedule
- Transparent rotation order
- Randomized or predetermined
- Auto-escalation for missed contributions

### Reputation System
- On-chain participation score
- History of completed circles
- Badges and achievements
- Trust metrics for invites

### Dispute Resolution
- Community voting
- Evidence submission
- Binding arbitration
- Slashing for bad actors

## Getting Started

### Prerequisites

- Node.js 18+
- Leather or Xverse wallet
- STX for transaction fees

### Installation

```bash
git clone https://github.com/faithorji/faithpool.git
cd faithpool
npm install
```

### Run Frontend

```bash
cd frontend
npm install
npm run dev
```

### Test Contracts

```bash
clarinet check
npm test
```

## Circle Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| Contribution Amount | STX per period | Configurable |
| Cycle Period | Days between rounds | 7 days |
| Member Limit | Max participants | 2-20 |
| Late Fee | Penalty for missed contributions | 5% |
| Grace Period | Days before penalty | 3 days |

## User Journey

### Creating a Circle
1. Set contribution amount and frequency
2. Choose rotation method (random/ordered)
3. Set member limit
4. Generate invite links
5. Activate when full

### Joining a Circle
1. Accept invite
2. Deposit first contribution
3. Confirm commitment
4. Receive payout schedule

### During the Circle
1. Receive reminders before each round
2. Contribute on time
3. Watch your reputation grow
4. Receive your payout on your turn

## Reputation Scoring

| Action | Points |
|--------|--------|
| On-time contribution | +10 |
| Completing a circle | +100 |
| Referring new member | +25 |
| Late contribution | -20 |
| Missed contribution | -50 |

## Security Features

- Multi-signature controls for circle parameters
- Time-locked withdrawals
- Escrow protection
- Post-conditions for STX transfers
- Emergency pause functionality

## Tech Stack

- **Smart Contracts**: Clarity + Clarinet
- **Frontend**: React 19 + TypeScript + Tailwind CSS
- **State Management**: Zustand
- **Blockchain**: Stacks.js
- **Notifications**: Push protocol integration

## Roadmap

- [ ] Mobile app
- [ ] Cross-chain deposits
- [ ] Circle insurance fund
- [ ] Governance token
- [ ] Lending against reputation

## License

MIT

---

**Building community wealth, one circle at a time**
