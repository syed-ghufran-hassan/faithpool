# HearthCircle

HearthCircle is a community-first savings circle platform built on Stacks. It modernizes rotating savings groups with transparent rules, trusted payouts, and member reputation.

## Why HearthCircle

- **Circle management** for creating, joining, and running shared savings pools.
- **Automated payouts** with predictable schedules and transparent records.
- **Trust signals** via reputation, participation history, and badges.
- **Wallet-ready** flows for Stacks-native deposits and withdrawals.

## Getting Started

### Prerequisites

- Node.js v18+
- npm v9+

### Install

```bash
git clone https://github.com/floxxih/savings-circle-net.git
cd savings-circle-net
npm install
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Contracts

```bash
clarinet check
```

## Project Layout

```
savings-circle-net/
├── contracts/        # Clarity smart contracts
│   ├── stacksusu-core-v7.clar
│   ├── stacksusu-escrow-v7.clar
│   ├── stacksusu-governance-v7.clar
│   └── stacksusu-reputation-v7.clar
├── frontend/         # React + Vite web app
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Contract integration layer
│   │   ├── utils/       # Helper utilities
│   │   └── pages/       # Page components
│   └── package.json
├── docs/             # Architecture and guides
│   ├── FRONTEND_ARCHITECTURE.md
│   ├── CONTRACTS.md
│   └── API.md
└── README.md         # Project documentation
```

## Key Features

### Smart Contract Integration

- **Contract Layer**: Centralized integration with Clarity contracts
- **Custom Hooks**: React hooks for blockchain interactions
- **Transaction Monitoring**: Real-time transaction status tracking
- **Post Conditions**: Safe STX transfers with verification

### Frontend Architecture

- **React 19**: Modern React with hooks and concurrent features
- **TypeScript**: Full type safety across the application
- **Stacks.js**: Seamless blockchain integration
- **Responsive Design**: Mobile-first, accessible UI

See [Frontend Architecture Guide](docs/FRONTEND_ARCHITECTURE.md) for detailed documentation.

## Contributing

See `CONTRIBUTING.md` for local setup, testing, and contribution guidelines.

## License

MIT
