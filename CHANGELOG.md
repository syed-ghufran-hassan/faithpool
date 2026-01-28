# Changelog

All notable changes to StackSusu are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [5.0.0] - 2026-01-24

### Added
- **Round-by-round contribution mode** - Members can now contribute each round instead of upfront only
- **Reputation system** (`stacksusu-reputation-v5`) - Track member reliability with trust scores
- **Referral program** (`stacksusu-referral-v5`) - Tiered rewards for referring new members
- **NFT slot marketplace** (`stacksusu-nft-v5`) - Trade circle positions as NFTs
- **Circle governance** (`stacksusu-governance-v5`) - Vote on circle proposals
- **Enhanced emergency system** (`stacksusu-emergency-v5`) - Improved withdrawal with cooldowns
- Minimum reputation requirement for joining circles
- Multi-mode escrow handling

### Changed
- Refactored escrow contract for dual contribution modes
- Improved error messages with more specific codes
- Gas optimization across all contracts
- Better inter-contract authorization checks

### Fixed
- Edge case in payout calculation for final round
- Nonce handling in batch transaction scenarios
- Member slot assignment race condition

### Security
- Added protocol pause capability
- Enhanced authorized caller verification
- Improved input validation bounds

---

## [4.0.0] - 2025-12-01

### Added
- Basic circle creation and management
- Upfront deposit mode
- Admin controls for protocol configuration
- NFT minting for circle slots
- Emergency withdrawal mechanism

### Changed
- Migrated from v3 trait definitions
- Improved escrow fund tracking

---

## [3.0.0] - 2025-10-15

### Added
- Initial prototype implementation
- Trait definitions (`stacksusu-traits-v2`)
- Basic escrow functionality
- Admin contract with fee management

### Known Issues
- Single contribution mode only
- No reputation tracking
- Limited governance options

---

## [2.0.0] - 2025-08-01

### Added
- Proof of concept contracts
- Basic circle lifecycle

---

## [1.0.0] - 2025-06-01

### Added
- Initial project setup
- Contract architecture design
- Frontend scaffolding

## [Unreleased]

### Section 1
Added detail about feature 1 to ensure clarity for users.

### Section 2
Added detail about feature 2 to ensure clarity for users.

### Section 3
Added detail about feature 3 to ensure clarity for users.

### Section 4
Added detail about feature 4 to ensure clarity for users.

### Section 5
Added detail about feature 5 to ensure clarity for users.

### Section 6
Added detail about feature 6 to ensure clarity for users.

### Section 7
Added detail about feature 7 to ensure clarity for users.

### Section 8
Added detail about feature 8 to ensure clarity for users.

### Section 9
Added detail about feature 9 to ensure clarity for users.
