# StackSusu Architecture

This document provides an overview of the StackSusu smart contract architecture and how the different components interact.

## System Overview

StackSusu is a decentralized savings circle (ROSCA) platform built on the Stacks blockchain. The system consists of multiple smart contracts that work together to provide a secure, transparent, and efficient savings experience.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              StackSusu v5                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐          │
│  │   Core (v5)      │◄───│   Admin (v5)    │───►│  Emergency (v5) │          │
│  │                  │    │                  │    │                  │          │
│  │  - Create Circle │    │  - Pause/Resume  │    │  - Emergency     │          │
│  │  - Join Circle   │    │  - Update Fees   │    │    Withdrawals   │          │
│  │  - Contributions │    │  - Set Params    │    │  - Fund Recovery │          │
│  │  - Payout Mgmt   │    │                  │    │                  │          │
│  └────────┬─────────┘    └─────────────────┘    └─────────────────┘          │
│           │                                                                   │
│           ▼                                                                   │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐          │
│  │   Escrow (v5)    │    │  Reputation (v5)│    │  Referral (v5)   │          │
│  │                  │    │                  │    │                  │          │
│  │  - Lock Funds    │    │  - Trust Scores  │    │  - Referral      │          │
│  │  - Release Payout│    │  - Track History │    │    Rewards       │          │
│  │  - Dispute Mgmt  │    │  - Trust Levels  │    │  - Commission    │          │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘          │
│                                                                              │
│  ┌─────────────────┐    ┌─────────────────┐                                  │
│  │  Governance (v5) │    │     NFT (v5)     │                                  │
│  │                  │    │                  │                                  │
│  │  - Proposals     │    │  - Membership    │                                  │
│  │  - Voting        │    │  - Achievement   │                                  │
│  │  - Execution     │    │  - Marketplace   │                                  │
│  └─────────────────┘    └─────────────────┘                                  │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │                       Traits (v3)                                │        │
│  │  - Defines interfaces for all contract interactions              │        │
│  └─────────────────────────────────────────────────────────────────┘        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Contract Descriptions

### Core Contract (stacksusu-core-v5)
The main contract handling circle lifecycle:
- **Circle Creation**: Initialize new savings circles with parameters
- **Membership**: Handle join requests and member management
- **Contributions**: Process and track member contributions
- **Payouts**: Manage payout distribution and scheduling

### Admin Contract (stacksusu-admin-v5)
Administrative functions for platform management:
- Pause/resume platform operations
- Update platform fees and parameters
- Manage admin roles and permissions

### Escrow Contract (stacksusu-escrow-v5)
Secure fund management:
- Lock contributions until payout conditions are met
- Handle payout releases with proper authorization
- Manage disputes between members and circles

### Reputation Contract (stacksusu-reputation-v5)
Trust and reputation tracking:
- Calculate and update trust scores based on behavior
- Track payment history (on-time, late, defaults)
- Assign trust levels (Bronze → Diamond)

### Referral Contract (stacksusu-referral-v5)
Incentive program management:
- Track referral relationships
- Calculate and distribute referral bonuses
- Manage commission structures

### Governance Contract (stacksusu-governance-v5)
Decentralized decision-making:
- Create and manage proposals
- Handle voting mechanisms
- Execute approved changes

### NFT Contract (stacksusu-nft-v5)
Non-fungible token features:
- Membership NFTs for circle participation
- Achievement NFTs for milestones
- Marketplace for NFT trading

### Emergency Contract (stacksusu-emergency-v5)
Safety mechanisms:
- Emergency pause functionality
- Fund recovery procedures
- Disaster recovery protocols

### Traits Contract (stacksusu-traits-v3)
Interface definitions:
- Standardized function signatures
- Cross-contract compatibility
- Version management

## Data Flow

### Creating a Circle
```
User → Core.create-circle() → Escrow.initialize() → NFT.mint-membership()
```

### Making a Contribution
```
User → Core.contribute() → Escrow.lock-contribution() → Reputation.record-payment()
```

### Receiving Payout
```
Admin/Schedule → Core.process-payout() → Escrow.release-payout() → User
```

## Security Model

1. **Access Control**: Role-based permissions via Admin contract
2. **Fund Safety**: All funds held in Escrow contract
3. **Emergency Controls**: Emergency contract can pause operations
4. **Reputation Gates**: Minimum trust levels required for certain actions

## Mainnet Deployment

All v5 contracts are deployed on Stacks mainnet:

| Contract | Address |
|----------|---------|
| Deployer | `SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N` |

## Version History

- **v3**: Initial mainnet release
- **v4**: Enhanced escrow and dispute resolution
- **v5**: Full governance, reputation, and referral systems
