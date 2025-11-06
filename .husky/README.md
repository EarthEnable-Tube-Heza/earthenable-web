# Husky Git Hooks

This directory contains Git hooks managed by [Husky](https://typicode.github.io/husky/).

## Setup

Husky is automatically installed when you run `npm install`. The hooks are configured to run automatically before certain Git operations.

## Pre-commit Hook

The pre-commit hook (`pre-commit`) runs before each commit and performs:

1. **Type Checking** - Runs `npm run type-check` to ensure TypeScript types are correct
2. **Lint-Staged** - Runs ESLint and Prettier on staged files only

## Configuration

- **Lint-staged config**: `.lintstagedrc.json` in the project root
- **TypeScript config**: `tsconfig.json` in the project root
- **ESLint config**: `eslint.config.mjs` and Next.js defaults

## Skipping Hooks (Emergency Only)

If you need to skip the pre-commit hook (not recommended):

```bash
git commit --no-verify -m "Your commit message"
```

## Troubleshooting

### Hooks not running

1. Ensure husky is installed: `npm install`
2. Check hook permissions: `chmod +x .husky/pre-commit`
3. Verify Git hooks path: `git config core.hooksPath`

### Type check failures

Fix TypeScript errors before committing. Run:
```bash
npm run type-check
```

### Lint failures

Fix ESLint errors. Run:
```bash
npm run lint:fix
```

## Why Pre-commit Hooks?

Pre-commit hooks prevent:
- ❌ Type errors that cause Vercel deployment failures
- ❌ ESLint violations that fail CI/CD
- ❌ Poorly formatted code
- ❌ Bugs from unintended `any` types

This ensures **only clean, type-safe code** reaches the repository and deployment pipeline.
