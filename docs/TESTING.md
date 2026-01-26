# Testing Guide

## Overview

This guide covers testing strategies for StackSusu contracts and frontend.

## Contract Testing

### Clarinet Check

Validate all contracts compile correctly:

```bash
clarinet check
```

This verifies:
- Syntax correctness
- Type safety
- Function signatures
- Trait implementations

### Clarinet Console

Interactive testing in the REPL:

```bash
clarinet console
```

Example session:
```clarity
;; Create a test circle
(contract-call? .stacksusu-core-v7 create-circle 
  "Test Circle" u1000000 u5 u7 u0 u0)

;; Check circle info
(contract-call? .stacksusu-core-v7 get-circle-info u1)
```

### Unit Tests

Run Vitest tests:

```bash
npm test
```

## Frontend Testing

### Setup

```bash
cd frontend
npm install
```

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch
```

### Writing Tests

Example test file:
```typescript
import { describe, it, expect } from 'vitest';
import { formatSTX } from '../utils/format';

describe('formatSTX', () => {
  it('formats microSTX correctly', () => {
    expect(formatSTX(1000000)).toBe('1.00 STX');
  });
});
```

## Best Practices

1. **Use devnet first** - Test on simulated network before testnet/mainnet
2. **Small amounts** - Use minimal STX for testing
3. **Verify state** - Check contract state after each operation
4. **Handle errors** - Test both success and failure paths

## Troubleshooting

### Common Issues

1. **Nonce conflicts** - Wait for pending transactions to clear
2. **Insufficient funds** - Check wallet balance before transactions
3. **Contract not found** - Verify deployment and contract names
4. **Rate limiting** - Add delays between API calls
