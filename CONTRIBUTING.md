# Contributing to StackSusu

Thank you for your interest in contributing to StackSusu! This document provides guidelines for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow

## Getting Started

### 1. Fork the Repository

Click "Fork" on GitHub to create your copy.

### 2. Clone Your Fork

```bash
git clone https://github.com/YOUR_USERNAME/Stacksusu.git
cd Stacksusu
```

### 3. Set Up Development Environment

```bash
# Install dependencies
npm install

# Install Clarinet (for contract development)
# See: https://docs.hiro.so/clarinet/getting-started

# Verify setup
clarinet check
```

### 4. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

## Development Workflow

### Making Changes

1. Write your code following the style guidelines
2. Add tests for new functionality
3. Update documentation if needed
4. Run linting and tests locally

### Code Style

- **TypeScript/JavaScript**: Use Prettier for formatting
- **Clarity**: Follow 2-space indentation
- **Commits**: Use conventional commit messages

#### Commit Message Format

```
type(scope): description

[optional body]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
- `feat(core): add round-by-round contribution mode`
- `fix(escrow): correct payout calculation`
- `docs: update API reference`

### Running Tests

```bash
# Check contracts
clarinet check

# Run unit tests
npm test

# Frontend tests
cd frontend && npm test
```

## Pull Request Process

### 1. Update Your Branch

```bash
git fetch upstream
git rebase upstream/main
```

### 2. Push Changes

```bash
git push origin feature/your-feature-name
```

### 3. Create Pull Request

- Use a clear, descriptive title
- Reference any related issues
- Describe what changes were made and why
- Include screenshots for UI changes

### 4. Code Review

- Address reviewer feedback
- Push additional commits as needed
- Squash commits before merging if requested

## Contract Development

### Security Requirements

All contract changes must:
- Pass `clarinet check` without errors
- Include comprehensive error handling
- Validate all inputs
- Document public functions

### Testing Requirements

- Test both success and failure cases
- Cover edge cases
- Include integration tests where applicable

## Documentation

When adding new features:
- Update API documentation
- Add usage examples
- Update changelog

## Questions?

- Open an issue for questions
- Join discussions on GitHub

Thank you for contributing! 🎉
