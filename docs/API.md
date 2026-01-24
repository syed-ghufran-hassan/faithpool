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
