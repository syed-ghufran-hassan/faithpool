# Frontend Architecture Guide

## Overview

HearthCircle's frontend is built with React, TypeScript, and Vite, integrating with Stacks blockchain for decentralized savings circles.

## Architecture

```
frontend/src/
├── components/      # Reusable UI components
├── hooks/          # Custom React hooks
├── lib/            # Core utilities and integrations
├── utils/          # Helper functions
├── pages/          # Page components
├── context/        # React context providers
└── types/          # TypeScript type definitions
```

## Key Technologies

- **React 19**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **Stacks.js**: Blockchain integration
- **React Router**: Client-side routing

## Contract Integration

### Using the Integration Layer

The `contract-integration.ts` module provides a centralized way to interact with smart contracts:

```typescript
import {
  buildCreateCircleOptions,
  getCircleInfo,
  formatStx,
} from './lib/contract-integration';

// Create a circle
const options = buildCreateCircleOptions({
  name: 'My Circle',
  contributionAmount: BigInt(1000000), // 1 STX
  duration: 4320, // ~30 days
  maxMembers: 10,
}, userAddress);

// Fetch circle data
const circle = await getCircleInfo(1);
console.log(formatStx(circle.contributionAmount));
```

### Using Custom Hooks

React hooks simplify contract interactions in components:

```typescript
import { useCircle, useUserCircles } from './hooks/use-contract';

function MyComponent() {
  const { circle, loading, error } = useCircle(1);
  const { circleIds } = useUserCircles(userAddress);
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <CircleDetails circle={circle} />;
}
```

### Transaction Monitoring

Monitor transaction status with callbacks:

```typescript
import { monitorTransaction } from './utils/transaction-monitor';

const txId = await createCircle();

await monitorTransaction(txId, {
  maxAttempts: 30,
  intervalMs: 10000,
  onUpdate: (status) => {
    console.log('Transaction status:', status.status);
    if (status.status === 'success') {
      showSuccessNotification();
    }
  },
});
```

## Component Patterns

### Container/Presenter Pattern

Separate business logic from presentation:

```typescript
// Container (handles logic)
function CircleListContainer() {
  const { circleIds, loading } = useUserCircles(userAddress);
  const circles = circleIds.map(id => useCircle(id));
  
  return <CircleList circles={circles} loading={loading} />;
}

// Presenter (renders UI)
function CircleList({ circles, loading }) {
  if (loading) return <LoadingState />;
  return circles.map(circle => <CircleCard key={circle.id} circle={circle} />);
}
```

### Custom Hooks Pattern

Extract reusable logic:

```typescript
function useCircleActions(circleId: number) {
  const [loading, setLoading] = useState(false);
  
  const contribute = useCallback(async (amount: bigint) => {
    setLoading(true);
    try {
      const options = buildContributeOptions({ circleId, amount }, userAddress);
      // Execute transaction
    } finally {
      setLoading(false);
    }
  }, [circleId]);
  
  return { contribute, loading };
}
```

## State Management

### Local State

Use `useState` for component-specific state:

```typescript
const [amount, setAmount] = useState<bigint>(BigInt(0));
```

### Context for Global State

Use React Context for app-wide state:

```typescript
// context/WalletContext.tsx
export const WalletContext = createContext<WalletState | null>(null);

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWallet must be within WalletProvider');
  return context;
}
```

## Error Handling

### Boundary Components

Catch errors at component boundaries:

```typescript
<ErrorBoundary fallback={<ErrorFallback />}>
  <CircleDetails circleId={id} />
</ErrorBoundary>
```

### Try-Catch in Async Functions

Handle errors in async operations:

```typescript
try {
  const circle = await getCircleInfo(id);
  setCircle(circle);
} catch (error) {
  setError(error instanceof Error ? error : new Error('Unknown error'));
  showErrorToast(error.message);
}
```

## Performance Optimization

### Memoization

Use `useMemo` and `useCallback`:

```typescript
const formattedAmount = useMemo(
  () => formatStx(circle.contributionAmount),
  [circle.contributionAmount]
);

const handleJoin = useCallback(() => {
  joinCircle(circleId);
}, [circleId]);
```

### Code Splitting

Lazy load routes:

```typescript
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CircleDetails = lazy(() => import('./pages/CircleDetails'));
```

## Testing

### Component Tests

Test components with Vitest:

```typescript
import { render, screen } from '@testing-library/react';
import { CircleCard } from './CircleCard';

test('displays circle name', () => {
  const circle = { name: 'Test Circle', /* ... */ };
  render(<CircleCard circle={circle} />);
  expect(screen.getByText('Test Circle')).toBeInTheDocument();
});
```

### Hook Tests

Test custom hooks:

```typescript
import { renderHook } from '@testing-library/react';
import { useCircle } from './use-contract';

test('fetches circle data', async () => {
  const { result } = renderHook(() => useCircle(1));
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.circle).toBeDefined();
});
```

## Best Practices

1. **Type Safety**: Always use TypeScript types
2. **Error Handling**: Handle all error cases
3. **Loading States**: Show loading indicators
4. **Accessibility**: Use semantic HTML and ARIA labels
5. **Performance**: Memoize expensive calculations
6. **Code Organization**: Keep files focused and small
7. **Documentation**: Document complex logic
8. **Testing**: Write tests for critical paths

## Common Patterns

### Form Handling

```typescript
function CreateCircleForm() {
  const [formData, setFormData] = useState<CircleParams>({
    name: '',
    contributionAmount: BigInt(0),
    duration: 4320,
    maxMembers: 10,
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const options = buildCreateCircleOptions(formData, userAddress);
    // Submit transaction
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Data Fetching

```typescript
useEffect(() => {
  let cancelled = false;
  
  async function fetchData() {
    const data = await getCircleInfo(id);
    if (!cancelled) {
      setCircle(data);
    }
  }
  
  fetchData();
  return () => { cancelled = true; };
}, [id]);
```

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Stacks.js Guide](https://docs.stacks.co/build/sdks/stacks.js)
- [Vite Documentation](https://vitejs.dev)
