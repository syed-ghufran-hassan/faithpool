# StackSusu v5 Smart Contracts

## Overview

StackSusu is a decentralized rotating savings and credit association (ROSCA) protocol built on the Stacks blockchain. Members form circles, contribute STX, and take turns receiving the pooled funds.

## Deployed Contracts

All contracts are deployed on Stacks mainnet by:
- **Deployer**: `SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N`

### Core Contracts

| Contract | Purpose | Size |
|----------|---------|------|
| `stacksusu-core-v5` | Circle creation, membership management, round tracking | 17,205 bytes |
| `stacksusu-escrow-v5` | STX deposits, payouts, contribution handling | 16,871 bytes |
| `stacksusu-admin-v5` | Protocol configuration, fee management, pause controls | 8,334 bytes |

### Supporting Contracts

| Contract | Purpose | Size |
|----------|---------|------|
| `stacksusu-reputation-v5` | Member trust scores, payment history tracking | 8,329 bytes |
| `stacksusu-referral-v5` | Referral program with tiered rewards | 8,981 bytes |
| `stacksusu-nft-v5` | Slot NFTs, marketplace for trading positions | 14,430 bytes |
| `stacksusu-governance-v5` | Circle-level voting on proposals | 10,640 bytes |
| `stacksusu-emergency-v5` | Emergency withdrawal system with penalties | 8,760 bytes |
| `stacksusu-traits-v3` | Interface trait definitions | 1,306 bytes |

## Contract Interactions

```
┌─────────────────┐     ┌──────────────────┐
│  stacksusu-core │────▶│ stacksusu-escrow │
└────────┬────────┘     └────────┬─────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌──────────────────┐
│stacksusu-admin  │     │stacksusu-nft     │
└─────────────────┘     └──────────────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────────┐
│ reputation-v5   │     │  referral-v5     │
└─────────────────┘     └──────────────────┘
```

## Key Features

### Circle Lifecycle
1. **Creation** - Creator sets contribution amount, max members, payout interval
2. **Joining** - Members join and select slots (payout order)
3. **Deposits** - Upfront or round-by-round contribution modes
4. **Payouts** - Each round, one member receives the pool
5. **Completion** - Circle ends when all members have received payouts

### Contribution Modes
- **Upfront (Mode 0)**: All members deposit full amount before circle starts
- **Round-by-Round (Mode 1)**: Members contribute each round

### Safety Features
- Emergency withdrawals with cooldown period
- Protocol pause capability
- Authorized caller verification between contracts
- Minimum reputation requirements for joining

## Error Codes

See individual contract files for complete error code documentation.

## Links

- [Explorer](https://explorer.stacks.co/address/SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N)
- [GitHub](https://github.com/AdekunleBamz/Stacksusu)
