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
├── contracts/     # Clarity contracts
├── frontend/      # React + Vite web app
├── docs/          # Architecture and guides
└── README.md      # Project documentation
```

## Contributing

See `CONTRIBUTING.md` for local setup, testing, and contribution guidelines.

## License

MIT
