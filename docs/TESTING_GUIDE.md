# Testing Guide

## Overview

This guide covers testing practices for the StackSUSU application, including unit tests, integration tests, and contract tests.

## Testing Stack

- **Framework**: Vitest
- **Contract Testing**: Clarinet SDK
- **Utilities**: @testing-library/react, @testing-library/jest-dom
- **Coverage**: c8

## Directory Structure

```
tests/
├── stacksusu.test.ts          # Main contract tests
frontend/
├── src/
│   ├── utils/
│   │   ├── __tests__/         # Utility tests
│   │   ├── test-utils.ts      # Testing utilities
│   │   └── mock-data.ts       # Mock data generators
│   └── components/
│       └── __tests__/         # Component tests
```

## Running Tests

```bash
# Run all tests
npm test

# Run contract tests only
npm run test:contracts

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run specific test file
npx vitest run frontend/src/utils/__tests__/logger.test.ts
```

## Contract Testing

### Example Test

```typescript
import { describe, it, expect, beforeAll } from "vitest";
import { Cl, ClarityType } from "@stacks/transactions";
import { initSimnet, Simnet } from "@hirosystems/clarinet-sdk";

let simnet: Simnet;

beforeAll(async () => {
  simnet = await initSimnet();
}, 60000);

describe("StackSUSU Core Contract", () => {
  it("should create a circle", async () => {
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;
    
    const result = simnet.callPublicFn(
      "stacksusu-core-v7",
      "create-circle",
      [
        Cl.stringAscii("Test Circle"),
        Cl.uint(1000000),
        Cl.uint(5),
        Cl.uint(7),
        Cl.uint(0),
        Cl.uint(0),
      ],
      deployer
    );
    
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
  });
});
```

### Test Patterns

1. **Setup**: Initialize Simnet before tests
2. **Accounts**: Use predefined accounts (deployer, wallet_1, etc.)
3. **Assertions**: Use `expect().toHaveClarityType()` for contract responses
4. **Cleanup**: State persists between tests, design accordingly

## Frontend Testing

### Component Testing

```typescript
import { render, screen } from '@testing-library/react';
import { renderWithProviders } from '@/utils/test-utils';
import { CircleCard } from '@/components/CircleCard';
import { mockCircle } from '@/utils/test-utils';

describe('CircleCard', () => {
  it('should render circle information', () => {
    const circle = mockCircle({ name: 'Test Circle' });
    render(<CircleCard circle={circle} />);
    
    expect(screen.getByText('Test Circle')).toBeInTheDocument();
  });
  
  it('should handle click events', () => {
    const onClick = vi.fn();
    const circle = mockCircle();
    render(<CircleCard circle={circle} onClick={onClick} />);
    
    screen.getByRole('button').click();
    expect(onClick).toHaveBeenCalled();
  });
});
```

### Utility Testing

```typescript
import { describe, it, expect } from 'vitest';
import { formatStx, truncateAddress } from '@/utils';

describe('Utilities', () => {
  describe('formatStx', () => {
    it('should format microSTX to STX', () => {
      expect(formatStx(1000000)).toBe('1.00');
    });
    
    it('should handle decimal amounts', () => {
      expect(formatStx(1500000)).toBe('1.50');
    });
  });
  
  describe('truncateAddress', () => {
    it('should truncate long addresses', () => {
      const address = 'SP2PABAF9FTAJYNFZH93XENAJ8FVWHC22BH8J8T4B';
      expect(truncateAddress(address)).toBe('SP2PAB...8T4B');
    });
  });
});
```

### Mock Data

```typescript
import { generateCircles, generateUsers } from '@/utils/mock-data';

// Generate test data
const circles = generateCircles(10);
const users = generateUsers(5, { balance: 10000000 });
```

## Mocking

### Wallet Mock

```typescript
import { mockStacksWallet } from '@/utils/test-utils';

beforeEach(() => {
  mockStacksWallet({
    isConnected: true,
    address: 'SP2PABAF9FTAJYNFZH93XENAJ8FVWHC22BH8J8T4B',
  });
});
```

### API Mock

```typescript
import { mockFetch } from '@/utils/test-utils';

global.fetch = mockFetch({ data: [] }, 200);
```

### LocalStorage Mock

```typescript
import { mockLocalStorage } from '@/utils/test-utils';

const storage = mockLocalStorage({ key: 'value' });
Object.defineProperty(window, 'localStorage', { value: storage });
```

## Best Practices

1. **Test Structure**: Use `describe` blocks to group related tests
2. **Naming**: Use descriptive test names ("should...", "when...", "given...")
3. **Isolation**: Each test should be independent
4. **Coverage**: Aim for >80% coverage
5. **Async**: Use `async/await` for async operations
6. **Cleanup**: Use `beforeEach`/`afterEach` for setup and cleanup

## Debugging Tests

```bash
# Run with debug output
DEBUG=* npx vitest run

# Run with UI
npx vitest --ui

# Run specific test
npx vitest run -t "should create a circle"
```

## CI/CD Integration

Tests run automatically on:
- Pull requests
- Main branch pushes
- Release creation

```yaml
# .github/workflows/ci.yml
- name: Run Tests
  run: npm test

- name: Check Coverage
  run: npm run test:coverage
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Clarinet SDK](https://github.com/hirosystems/clarinet)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
