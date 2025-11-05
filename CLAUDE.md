# CLAUDE.md - EarthEnable Web Dashboard

This file provides guidance to Claude Code when working with the EarthEnable Web Dashboard.

## Project Overview

The EarthEnable Web Dashboard is a Next.js admin interface for managing users, forms, and viewing analytics for the EarthEnable field operations system.

## Local Development Path

**Web Dashboard**: `/home/c4pt_mvm0/Poubelle/earthenable/earthenable-web`

## Repository Structure

```
earthenable-web/
├── src/
│   ├── app/              # Next.js App Router (file-based routing)
│   ├── components/       # Reusable UI components
│   ├── lib/
│   │   ├── api/          # API client with auto token refresh
│   │   ├── auth/         # Auth context, hooks, and utilities
│   │   └── theme/        # Theme constants matching mobile app
│   ├── hooks/            # Custom React hooks
│   └── types/            # TypeScript type definitions
├── public/               # Static assets
└── .env.local           # Environment variables (not committed)
```

## Theme System

### Color Palette

The web dashboard uses **the exact same theme** as the React Native mobile app for visual consistency:

**Brand Colors:**
- Primary Orange: `#EA6A00`
- Secondary Dark Red/Brown: `#78373B`
- Accent Gold: `#D5A34C`
- Green: `#124D37`
- Blue: `#3E57AB`

**Backgrounds:**
- Primary Cream: `#F7EDDB`
- White: `#FFFFFF`
- Light: `#FDFCFC`

**Status Colors:**
- Error: `#E04562`
- Success: `#124D37`
- Warning: `#D5A34C`
- Info: `#3E57AB`

### Typography

**Font Families** (via Google Fonts):
1. **Ropa Sans** - Headings and titles
2. **Literata** - Flourish elements
3. **Lato** - Body text and UI

### Tailwind Configuration

Theme is configured in `tailwind.config.ts` to match the mobile app's design system.

## Authentication Flow

### Google OAuth Integration

**Flow:**
1. User clicks "Sign in with Google"
2. Google OAuth popup/redirect
3. Exchange Google token for JWT via `/api/v1/auth/google`
4. Store access + refresh tokens (localStorage)
5. Redirect to `/dashboard`

**Token Management:**
- Access token: 30 days expiry
- Refresh token: 90 days expiry
- Auto-refresh: 7 days before expiry
- Refresh threshold: Configurable via environment

**Protected Routes:**
- Middleware checks auth status
- Redirects to `/auth/signin` if unauthenticated
- Role-based access control (admin-only pages)

## API Client Architecture

### Auto Token Refresh Pattern

The API client (`src/lib/api/apiClient.ts`) implements:

```typescript
// Request interceptor: Inject Bearer token
// Response interceptor: Handle 401 with auto-refresh
// Queue requests during token refresh
```

**Key Features:**
- Automatic token injection in headers
- 401 detection triggers refresh
- Request queueing during refresh (prevents race conditions)
- Retry original request with new token
- Sign out on refresh failure

### API Version Management

API endpoints use versioned base URL:
```
NEXT_PUBLIC_API_BASE_URL/api/NEXT_PUBLIC_API_VERSION/...
```

Default version: `v1`

## Development Workflow

### Branch Strategy

- **main** - Production releases (deployed to production)
- **develop** - Development branch (deployed to staging)
- **feature/*** - Feature branches
- **bugfix/*** - Bug fixes

### Workflow Steps

1. **Create feature branch from develop**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/user-list-page
   ```

2. **Make changes and commit**
   ```bash
   git add .
   git commit -m "feat: add user list page with search"
   git push origin feature/user-list-page
   ```

3. **Create PR to develop**
   ```bash
   gh pr create --base develop --head feature/user-list-page \
     --title "feat: User list page" \
     --body "## Changes\n- Add user list with search\n- Implement pagination\n\n## Testing\n- [x] Manual testing complete"
   ```

4. **After PR approval, merge to develop**

5. **For production release:**
   ```bash
   gh pr create --base main --head develop \
     --title "Release: v1.0.0" \
     --body "## Changes\n- User management\n\n## Testing\n- [x] All tests pass"
   ```

## Code Quality Standards

### Type Checking
```bash
npm run type-check    # TypeScript check (fast, no build)
```

### Linting
```bash
npm run lint          # ESLint
npm run lint:fix      # Auto-fix issues
```

### Formatting
```bash
npm run format        # Prettier
```

### Run All Checks
```bash
npm run check-all     # Type check + lint + test
```

## Common Commands

### Development
```bash
npm run dev           # Start dev server (http://localhost:3000)
npm run build         # Production build
npm start             # Start production server
```

### Code Quality
```bash
npm run type-check    # TypeScript validation
npm run lint          # ESLint check
npm run format        # Prettier formatting
npm run check-all     # All checks
```

### Testing
```bash
npm test              # Run tests
npm run test:watch    # Watch mode
npm run test:coverage # Generate coverage report
```

## Environment Variables

### Required Variables

Create `.env.local`:

```bash
# Backend API
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_API_VERSION=v1

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id

# App Config
NEXT_PUBLIC_APP_NAME=EarthEnable Dashboard
NEXT_PUBLIC_COMPANY_DOMAIN=earthenable.org

# Token Management
NEXT_PUBLIC_TOKEN_REFRESH_THRESHOLD=10080  # Minutes (7 days)
NEXT_PUBLIC_TOKEN_CRITICAL_THRESHOLD=1440  # Minutes (24 hours)
```

### Environment-Specific URLs

- **Local Development**: `http://localhost:8000`
- **Development Server**: `https://api-dev.earthenable.org`
- **Production**: `https://api.earthenable.org`

## Backend Integration

### Admin Endpoints

The dashboard communicates with these backend endpoints:

```
GET    /api/v1/admin/users              # List users
GET    /api/v1/admin/users/{id}         # User details
PATCH  /api/v1/admin/users/{id}         # Update user
GET    /api/v1/admin/users/stats        # User statistics

GET    /api/v1/admin/forms/mappings     # Form mappings
PATCH  /api/v1/admin/forms/mappings/{id} # Update mapping
```

**Authorization**: All admin endpoints require `role='admin'`

### Shared Models

TypeScript types should match backend Pydantic schemas:

```typescript
// src/types/user.ts
export enum UserRole {
  QA_AGENT = 'qa_agent',
  MANAGER = 'manager',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}
```

## Component Patterns

### Server Components (Default)

Use for data fetching, SEO-critical pages:

```typescript
// app/dashboard/users/page.tsx
export default async function UsersPage() {
  // Fetch data on server
  const users = await getUsers();
  return <UsersList users={users} />;
}
```

### Client Components

Use for interactivity, state, effects:

```typescript
'use client';

export function UserEditModal({ user }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  // ... interactive logic
}
```

### Protected Route Wrapper

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token');

  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }
}
```

## Common Issues

### Environment Variables Not Loading

- Restart dev server after changing `.env.local`
- Ensure variables start with `NEXT_PUBLIC_` for client-side access
- Server-side variables don't need prefix

### CORS Errors

- Ensure backend has CORS enabled for dashboard URL
- Check `allowed_origins` in FastAPI CORS middleware

### Token Refresh Loops

- Check token expiry is set correctly in backend
- Verify refresh endpoint returns valid tokens
- Ensure localStorage is accessible (not disabled)

## Related Projects

- **Backend API**: `/home/c4pt_mvm0/Poubelle/earthenable/earthenable-api`
- **Mobile App**: `/home/c4pt_mvm0/Poubelle/earthenable/earthenable-app`
- **Main CLAUDE.md**: `/home/c4pt_mvm0/Poubelle/earthenable/CLAUDE.md`

## Additional Documentation

- Backend API Docs: `http://localhost:8000/docs` (when running)
- Next.js Docs: https://nextjs.org/docs
- Tailwind CSS: https://tailwindcss.com/docs
- TanStack Query: https://tanstack.com/query/latest
