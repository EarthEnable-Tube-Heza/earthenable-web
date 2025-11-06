# Contributing to EarthEnable Hub

Thank you for your interest in contributing to the EarthEnable Hub! This document provides guidelines and information for contributors.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Quality Standards](#code-quality-standards)
- [CI/CD Pipeline](#cicd-pipeline)
- [Pull Request Process](#pull-request-process)
- [Branch Strategy](#branch-strategy)
- [Testing Guidelines](#testing-guidelines)
- [Deployment Process](#deployment-process)

## Getting Started

### Prerequisites

- Node.js 24+ (currently using v24.11.0)
- npm (comes with Node.js)
- Git
- GitHub account

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/EarthEnable-Tube-Heza/earthenable-web.git
   cd earthenable-web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Verify setup**
   ```bash
   npm run type-check  # TypeScript check
   npm run lint        # ESLint check
   npm test            # Run tests
   ```

## Development Workflow

### 1. Create a Feature Branch

Always create a new branch for your work:

```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/` - New features
- `bugfix/` - Bug fixes
- `hotfix/` - Urgent production fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation updates

### 2. Make Your Changes

- Write clean, maintainable code
- Follow the existing code style
- Add tests for new functionality
- Update documentation as needed
- Use TypeScript properly (no `any` types)

### 3. Run Quality Checks Locally

Before committing, ensure all checks pass:

```bash
npm run check-all  # Runs type-check + lint + test
```

Individual commands:
```bash
npm run type-check   # TypeScript validation
npm run lint         # ESLint
npm run lint:fix     # Auto-fix ESLint issues
npm run format       # Prettier formatting
npm test             # Run tests
npm run test:coverage # Generate coverage report
```

### 4. Commit Your Changes

Write clear, descriptive commit messages:

```bash
git add .
git commit -m "feat: add user search functionality"
```

Commit message prefixes:
- `feat:` - New features
- `fix:` - Bug fixes
- `refactor:` - Code refactoring
- `test:` - Add or update tests
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `chore:` - Maintenance tasks

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
gh pr create --base develop --head feature/your-feature-name
```

## Code Quality Standards

### TypeScript

- Use strict TypeScript (no `any` types)
- Define interfaces for props and data structures
- Export types alongside components

```typescript
export interface ButtonProps {
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', onClick }) => {
  // Component implementation
};
```

### React Components

- Use functional components with hooks
- Use `'use client'` directive for client components
- Server components by default (no directive)
- Follow the component structure:

```typescript
'use client'; // Only if needed

import { useState } from 'react';
import { ComponentProps } from './types';

export function Component({ prop1, prop2 }: ComponentProps) {
  const [state, setState] = useState<string>('');

  // Component logic

  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### Styling

- Use Tailwind CSS utility classes
- Use theme constants from `src/lib/theme/constants.ts`
- Match mobile app colors for consistency
- Use the `cn()` utility for conditional classes

```typescript
import { cn } from '@/src/lib/theme';

<button className={cn(
  'base-classes',
  variant === 'primary' && 'primary-classes',
  isDisabled && 'disabled-classes'
)} />
```

## CI/CD Pipeline

Our CI/CD pipeline automatically runs checks and deployments on every push and pull request.

### Continuous Integration (CI)

**Workflow:** `.github/workflows/ci.yml`

**Triggers:**
- Push to `main`, `develop`, or `feature/*` branches
- Pull requests to `main` or `develop`

**Steps:**
1. **Lint and Test**
   - TypeScript type checking (`npm run type-check`)
   - ESLint linting (`npm run lint`)
   - Jest tests with coverage (`npm run test:coverage`)
   - Upload coverage to Codecov

2. **Build**
   - Build Next.js app (`npm run build`)
   - Verify build artifacts

3. **Security**
   - npm security audit (`npm audit`)

**All checks must pass before merging!**

### Preview Deployments

**Workflow:** `.github/workflows/deploy-preview.yml`

**Triggers:**
- Pull requests to `develop` branch

**Steps:**
1. Build Next.js app
2. Deploy to Vercel preview environment
3. Comment PR with preview URL

**Result:** Every PR gets a unique preview URL for testing

### Production Deployments

**Workflow:** `.github/workflows/deploy-production.yml`

**Triggers:**
- Push to `main` branch

**Steps:**
1. Build Next.js app for production
2. Deploy to Vercel production
3. Create GitHub release with version tag
4. Generate changelog from commits

**Result:** Automatic production deployment with release notes

## Pull Request Process

### 1. Create Pull Request

Target branch:
- `develop` for features and bug fixes
- `main` for releases (via PR from `develop`)

### 2. Fill Out PR Template

Include:
- **Description** - What changes were made and why
- **Type of Change** - Feature, bug fix, refactor, etc.
- **Testing** - How was it tested
- **Screenshots** - For UI changes
- **Checklist** - Confirm all requirements met

### 3. Wait for CI Checks

GitHub Actions will automatically:
- ✅ Run all quality checks
- ✅ Build the application
- ✅ Deploy preview environment
- ✅ Comment with preview URL

### 4. Request Reviews

- At least 1 approval required for `develop`
- At least 2 approvals required for `main`

### 5. Address Feedback

- Make requested changes
- Push updates (CI re-runs automatically)
- Request re-review

### 6. Merge

Once approved and all checks pass:
- Use "Squash and merge" for clean history
- Delete branch after merge

## Branch Strategy

```
main (production)
  ↑
  └── develop (staging)
        ↑
        ├── feature/user-management
        ├── feature/dashboard-stats
        └── bugfix/auth-token-refresh
```

### Branch Protection Rules

**`main` branch:**
- Requires pull request
- Requires 2 approvals
- Requires status checks to pass
- No direct pushes allowed

**`develop` branch:**
- Requires pull request
- Requires 1 approval
- Requires status checks to pass
- No direct pushes allowed

## Testing Guidelines

### Unit Tests

Write tests for:
- Components (UI behavior)
- Utility functions
- Custom hooks
- API client methods

Example:
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button Component', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Integration Tests

Test complete flows:
- User authentication
- Form submissions
- API interactions
- Page navigation

### Coverage Requirements

- Minimum 80% line coverage for new code
- Tests must pass before merging
- Coverage reports uploaded to Codecov

## Deployment Process

### Automatic Deployments

- **Preview:** Every PR to `develop` → Vercel preview
- **Production:** Every push to `main` → Vercel production

### Manual Deployments

If needed, deploy manually using Vercel CLI:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Environment Variables

Required secrets in GitHub (Settings → Secrets):
- `VERCEL_TOKEN` - Vercel API token
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID
- `CODECOV_TOKEN` - Codecov API token (optional)
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` - Google OAuth client ID
- `NEXT_PUBLIC_API_BASE_URL` - Backend API URL

## Getting Help

- **Issues:** Report bugs or request features via [GitHub Issues](https://github.com/EarthEnable-Tube-Heza/earthenable-web/issues)
- **Discussions:** Ask questions in [GitHub Discussions](https://github.com/EarthEnable-Tube-Heza/earthenable-web/discussions)
- **Documentation:** See [CLAUDE.md](./CLAUDE.md) for project architecture

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Follow the coding standards
- Test your changes thoroughly
- Document your code

Thank you for contributing to EarthEnable! 🌍💚
