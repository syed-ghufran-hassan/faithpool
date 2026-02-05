# StackSUSU Frontend Contributing Guidelines

Thank you for your interest in contributing to StackSUSU!

## Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy environment config: `cp .env.example .env`
4. Start dev server: `npm run dev`

## Code Style

### TypeScript

- Use strict TypeScript - avoid `any` types
- Prefer `interface` over `type` for object shapes
- Use `unknown` for truly unknown types
- Always define return types for functions

### React

- Use functional components with hooks
- Wrap components with `memo()` when appropriate
- Use `forwardRef` for components accepting refs
- Prefer `useCallback` and `useMemo` for optimization

### CSS

- Follow BEM naming: `.block__element--modifier`
- Use CSS custom properties from design tokens
- Keep component styles in co-located `.css` files

### Naming Conventions

- **Components**: PascalCase (`Button.tsx`)
- **Hooks**: camelCase with `use` prefix (`useTheme.ts`)
- **Utils**: camelCase (`formatDate.ts`)
- **Constants**: SCREAMING_SNAKE_CASE

## Commit Messages

Follow conventional commits:

```
type(scope): description

feat(Button): add loading state
fix(Modal): correct z-index stacking
docs(README): update setup instructions
refactor(hooks): extract common logic
style(Card): adjust border radius
perf(List): virtualize long lists
```

## Pull Request Process

1. Create feature branch from `main`
2. Make changes with descriptive commits
3. Run `npm run lint` and `npm run type-check`
4. Open PR with clear description
5. Address review feedback

## File Structure

```
src/
├── components/     # Reusable UI components
├── hooks/          # Custom React hooks
├── pages/          # Route page components
├── utils/          # Utility functions
├── types/          # TypeScript definitions
└── ...
```

## Questions?

Open an issue or reach out to the team!
