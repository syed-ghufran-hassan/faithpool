# Getting Started with StackSusu

## Prerequisites

- **Node.js** v18 or higher
- **Clarinet CLI** v2.0+ ([Installation Guide](https://docs.hiro.so/clarinet/getting-started))
- **Git** for version control
- A **Stacks wallet** (Leather, Xverse, or similar)

## Installation

### Clone the Repository

```bash
git clone https://github.com/AdekunleBamz/Stacksusu.git
cd Stacksusu
```

### Install Dependencies

```bash
# Root dependencies (for testing)
npm install

# Frontend dependencies
cd frontend
npm install
```

## Running Tests

### Contract Validation

```bash
# Check all contracts compile correctly
clarinet check
```

### Unit Tests

```bash
# Run Vitest tests
npm test
```

## Local Development

### Clarinet Console

Start an interactive Clarity REPL:

```bash
clarinet console
```

Try creating a circle:

```clarity
(contract-call? .stacksusu-core-v5 create-circle "Test Circle" u1000000 u5 u7 u0 u0)
```

### Frontend Development

```bash
cd frontend
npm run dev
```

Visit `http://localhost:5173` in your browser.

## Creating Your First Circle

### Step 1: Connect Wallet
Connect your Stacks wallet to the frontend.

### Step 2: Create Circle
Call `create-circle` with:
- Name: "My Savings Circle"
- Contribution: 1 STX (1000000 microSTX)
- Max Members: 5
- Interval: 7 days
- Mode: 0 (upfront)
- Min Reputation: 0

### Step 3: Invite Members
Share the circle ID with friends to join.

### Step 4: Deposit
Each member deposits `contribution × max-members` STX.

### Step 5: Claim Payouts
Each round, one member can claim the pooled funds.

## Project Structure

```
stacksusu/
├── contracts/          # Clarity smart contracts
├── deployments/        # Deployment configurations
├── docs/               # Documentation
├── frontend/           # React frontend
├── settings/           # Network configs
└── tests/              # Test scripts
```

## Next Steps

- Read the [API Reference](API.md)
- Review [Contract Documentation](CONTRACTS.md)
- Check [Security Considerations](SECURITY.md)

## Need Help?

- [GitHub Issues](https://github.com/AdekunleBamz/Stacksusu/issues)
- [Stacks Discord](https://discord.gg/stacks)
