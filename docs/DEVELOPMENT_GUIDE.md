# Development Guide

## Getting Started

### Prerequisites

- Node.js v20+
- npm v10+
- Clarinet (for contract development)
- Git

### Quick Start

```bash
# Clone the repository
git clone https://github.com/harobedjosh-alt/savings-circle-net.git
cd savings-circle-net

# Install dependencies
npm run setup

# Start development server
npm run dev

# Run tests
npm test
```

## Project Structure

```
stacksusu/
├── contracts/          # Clarity smart contracts
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── utils/       # Utility functions
│   │   ├── types/       # TypeScript types
│   │   └── services/    # API services
├── tests/             # Contract tests
├── docs/              # Documentation
└── deployments/       # Deployment configurations
```

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feat/your-feature-name
```

### 2. Make Changes

- Write code following the established patterns
- Add tests for new functionality
- Update documentation as needed

### 3. Run Quality Checks

```bash
# Run all checks
npm run check

# Or run individually
npm run lint        # ESLint
npm run type-check  # TypeScript
npm test           # Tests
clarinet check     # Contract validation
```

### 4. Commit Changes

Pre-commit hooks will automatically:
- Run linting on staged files
- Check TypeScript types
- Validate contracts

```bash
git add .
git commit -m "feat: add your feature description"
```

### 5. Push and Create PR

```bash
git push -u origin feat/your-feature-name
gh pr create
```

## Available Scripts

### Root Directory Scripts

```bash
npm run test              # Run all tests
npm run test:coverage     # Run tests with coverage
npm run test:ui          # Run tests with UI
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run type-check       # Run TypeScript checks
npm run format           # Format with Prettier
npm run format:check     # Check formatting
npm run check            # Run lint + type-check + contract check
npm run check:all        # Run all checks + tests
npm run dev              # Start development server
npm run build            # Build for production
npm run clean            # Clean build artifacts
npm run setup            # Install all dependencies
npm run update-deps      # Update all dependencies
```

### Frontend Scripts (from frontend/)

```bash
npm run dev              # Start Vite dev server
npm run build            # Build for production
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run type-check       # Run TypeScript checks
npm run preview          # Preview production build
npm run clean            # Clean build artifacts
```

## Code Style

### TypeScript/React

- Use functional components with hooks
- Prefer `const` over `let`
- Use destructuring for props
- Add JSDoc comments for public APIs
- Follow existing naming conventions

Example:
```typescript
/**
 * CircleCard component displays circle information
 * @param props CircleCard props
 */
export function CircleCard({ circle, onClick }: CircleCardProps) {
  const handleClick = () => {
    onClick?.(circle.id);
  };
  
  return (
    <div className="circle-card" onClick={handleClick}>
      <h3>{circle.name}</h3>
      <p>{circle.description}</p>
    </div>
  );
}
```

### Clarity

- Use descriptive function names
- Add comments for complex logic
- Follow contract naming conventions (stacksusu-*-v7)
- Use constants for magic numbers

Example:
```clarity
;; Creates a new savings circle
(define-public (create-circle 
  (name (string-ascii 50))
  (contribution uint)
  (max-members uint))
  (let ((circle-id (+ (var-get next-circle-id) u1)))
    ;; Validate inputs
    (asserts! (> (len name) u0) ERR_INVALID_NAME)
    (asserts! (> contribution u0) ERR_INVALID_AMOUNT)
    
    ;; Create circle
    (map-set circles circle-id {
      creator: tx-sender,
      name: name,
      contribution: contribution,
      max-members: max-members,
    })
    
    (var-set next-circle-id circle-id)
    (ok circle-id)
  )
)
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run with watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run specific test file
npx vitest run tests/stacksusu.test.ts
```

### Writing Tests

- Use descriptive test names
- Test both success and failure cases
- Mock external dependencies
- Keep tests isolated

Example:
```typescript
describe('CircleCard', () => {
  it('should render circle information', () => {
    const circle = mockCircle({ name: 'Test Circle' });
    render(<CircleCard circle={circle} />);
    expect(screen.getByText('Test Circle')).toBeInTheDocument();
  });
  
  it('should call onClick when clicked', () => {
    const onClick = vi.fn();
    const circle = mockCircle();
    render(<CircleCard circle={circle} onClick={onClick} />);
    
    screen.getByRole('button').click();
    expect(onClick).toHaveBeenCalledWith(circle.id);
  });
});
```

## Debugging

### Frontend Debugging

Use the debug utilities:
```typescript
import { debug } from '@/utils/debug';

debug.log('Component state', state);
debug.group('Data loading', () => {
  debug.log('Fetching circles');
  // ... fetch logic
});
```

### Contract Debugging

Use print statements in Clarity:
```clarity
(print {event: "circle-created", circle-id: circle-id, creator: tx-sender})
```

Check the Clarinet console output when running tests.

### Browser DevTools

- Use React DevTools for component inspection
- Use Redux DevTools (if using Redux) for state inspection
- Check the console for debug output

## Common Issues

### Build Issues

**Problem**: Build fails with TypeScript errors  
**Solution**: Run `npm run type-check` to see specific errors

**Problem**: Contracts fail to compile  
**Solution**: Run `clarinet check` to see contract errors

**Problem**: Dependencies out of date  
**Solution**: Run `npm run update-deps`

### Runtime Issues

**Problem**: Wallet connection fails  
**Solution**: Check wallet extension is installed and enabled

**Problem**: Transactions fail  
**Solution**: Check wallet has sufficient STX balance

## Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Clarity Reference](https://docs.stacks.co/clarity/)
- [Stacks.js Documentation](https://stacks.js.org/)
- [Clarinet Documentation](https://github.com/hirosystems/clarinet)

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines.

## Support

- Create an issue on GitHub
- Join our Discord community
- Email: dev-team@stacksusu.com
