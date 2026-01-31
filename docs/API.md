# StackSusu API Reference

## stacksusu-core-v5

### Public Functions

#### create-circle
Creates a new savings circle.

```clarity
(define-public (create-circle 
  (name (string-ascii 50))
  (contribution uint)
  (max-members uint)
  (payout-interval-days uint)
  (contribution-mode uint)
  (min-reputation uint))
  (response uint uint))
```

**Parameters:**
- `name` - Circle display name (max 50 characters)
- `contribution` - Amount per member per round in microSTX
- `max-members` - Maximum circle size (3-50)
- `payout-interval-days` - Days between payouts (1-30)
- `contribution-mode` - 0 = upfront, 1 = round-by-round
- `min-reputation` - Minimum reputation score required (0-1000)

**Returns:** `(ok circle-id)` or error code

---

#### join-circle
Join an existing pending circle.

```clarity
(define-public (join-circle (circle-id uint))
  (response bool uint))
```

**Returns:** `(ok true)` or error code

---

#### join-circle-with-referral
Join a circle with referral tracking for rewards.

```clarity
(define-public (join-circle-with-referral 
  (circle-id uint) 
  (referrer principal))
  (response bool uint))
```

---

### Read-Only Functions

#### get-circle-info
```clarity
(define-read-only (get-circle-info (circle-id uint))
  (optional {
    creator: principal,
    name: (string-ascii 50),
    contribution: uint,
    max-members: uint,
    payout-interval: uint,
    status: uint,
    current-round: uint,
    start-block: uint,
    member-count: uint,
    created-at: uint,
    contribution-mode: uint,
    min-reputation: uint
  }))
```

#### is-member
```clarity
(define-read-only (is-member (circle-id uint) (member principal))
  (response bool uint))
```

---

## stacksusu-escrow-v5

### Public Functions

#### deposit
Deposit STX for upfront mode circles.

```clarity
(define-public (deposit (circle-id uint) (amount uint))
  (response bool uint))
```

**Note:** Amount must equal `contribution * max-members`

---

#### claim-payout
Claim your payout when it's your turn.

```clarity
(define-public (claim-payout (circle-id uint))
  (response uint uint))
```

**Returns:** `(ok payout-amount)` or error code

---

#### contribute-round
Contribute for a specific round (round-by-round mode).

```clarity
(define-public (contribute-round 
  (circle-id uint) 
  (round uint) 
  (amount uint))
  (response bool uint))
```

---

## stacksusu-reputation-v5

### Read-Only Functions

#### get-reputation
```clarity
(define-read-only (get-reputation (member principal))
  (optional {
    circles-completed: uint,
    circles-defaulted: uint,
    on-time-payments: uint,
    late-payments: uint,
    total-volume: uint,
    score: uint
  }))
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 1000 | Not authorized |
| 1001 | Circle not found |
| 1002 | Circle is full |
| 1004 | Already a member |
| 1005 | Not a member |
| 1006 | Invalid contribution |
| 1007 | Invalid member count |
| 1009 | Already deposited |
| 1010 | Deposit required |
| 1012 | Payout not due |
| 1013 | Already claimed |
| 1014 | Not your turn |
| 1021 | Protocol paused |
| 1027 | Reputation too low |

---

## API Versioning

### Current Version: v7

All contracts have been upgraded to version 7 with the following improvements:

- **Performance**: Optimized read and write operations
- **Security**: Enhanced access control mechanisms
- **Features**: Added new governance and referral features
- **Gas Optimization**: Reduced transaction costs

### Legacy Versions

- v5: Stable legacy version (maintenance mode)
- v6: Transitional version (deprecated)
- v3-v4: Deprecated (not recommended for use)

### Migration Guide

To migrate from v5 to v7:

1. Update contract addresses in your frontend configuration
2. Review new error codes and handle appropriately
3. Test all functionality on testnet before mainnet deployment
4. Update documentation references

---

## Rate Limiting

The Stacks blockchain has the following rate limits:

- **Read-only calls**: No limit (free)
- **Contract calls**: Block-based, depends on network congestion
- **Deploys**: Limited by STX balance for transaction fees

---

## WebSocket Events

Subscribe to real-time updates using the Stacks API WebSocket:

```javascript
const ws = new WebSocket('wss://api.mainnet.hiro.so/');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'contract-event') {
    handleCircleEvent(data);
  }
};
```

Events include:
- `circle-created`: New circle creation
- `member-joined`: Member joining circle
- `contribution-made`: New contribution recorded
- `payout-claimed`: Payout distribution

---

## SDK Integration

### JavaScript/TypeScript

```typescript
import { StacksMainnet } from '@stacks/network';
import { callReadOnlyFunction, makeContractCall } from '@stacks/transactions';

const network = new StacksMainnet();
const contractAddress = 'SP2PAB...';
const contractName = 'stacksusu-core-v7';

// Read circle info
const circleInfo = await callReadOnlyFunction({
  network,
  contractAddress,
  contractName,
  functionName: 'get-circle-info',
  functionArgs: [uintCV(1)],
});
```

### Python

```python
from stacks_transactions import make_contract_call

# Create circle transaction
tx = make_contract_call(
    contract_address="SP2PAB...",
    contract_name="stacksusu-core-v7",
    function_name="create-circle",
    function_args=[...]
)
```
