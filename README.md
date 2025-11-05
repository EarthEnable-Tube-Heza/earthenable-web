# EarthEnable Web Dashboard

> Admin and manager web dashboard for EarthEnable field operations management

## Overview

The EarthEnable Web Dashboard is a Next.js application that provides administrative and managerial interfaces for the EarthEnable system. It enables:

- **User Management**: View, search, and manage user roles and permissions
- **Form Configuration**: Manage TaskSubject-to-FormYoula form mappings
- **Statistics & Analytics**: Department and jurisdiction performance dashboards
- **Task Management**: Assign and track field tasks (future)
- **Data Review**: Review and analyze field data (future)

## Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (matching React Native app theme)
- **State Management**:
  - Zustand (client state)
  - TanStack Query (server state)
- **Authentication**: Google OAuth (via FastAPI backend)
- **API Client**: Axios with auto token refresh
- **Forms**: React Hook Form + Zod validation
- **Tables**: TanStack Table
- **Charts**: Recharts

## Project Structure

```
earthenable-web/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── layout.tsx    # Root layout
│   │   ├── page.tsx      # Landing/redirect
│   │   ├── auth/
│   │   │   └── signin/   # Sign-in page
│   │   └── dashboard/
│   │       ├── layout.tsx        # Dashboard layout
│   │       ├── page.tsx          # Dashboard home
│   │       ├── users/            # User management
│   │       ├── forms/            # Form configuration
│   │       └── stats/            # Manager stats
│   ├── components/       # Reusable components
│   ├── lib/
│   │   ├── api/          # API client
│   │   ├── auth/         # Auth context & hooks
│   │   └── theme/        # Theme constants
│   ├── hooks/            # Custom hooks
│   └── types/            # TypeScript types
├── public/
└── .env.local
```

## System Requirements

- **Node.js**: 24+ (currently using v24.11.0)
- **npm**: 10+
- **Backend API**: EarthEnable FastAPI backend (earthenable-api)

## Getting Started

### Installation

```bash
# Clone repository
git clone https://github.com/earthenable/earthenable-web.git
cd earthenable-web

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Configure environment variables
# Edit .env.local with your values
```

### Environment Variables

Create `.env.local`:

```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_API_VERSION=v1

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id

# App Configuration
NEXT_PUBLIC_APP_NAME=EarthEnable Dashboard
NEXT_PUBLIC_COMPANY_DOMAIN=earthenable.org
```

### Development

```bash
# Run development server
npm run dev

# Open browser at http://localhost:3000
```

### Building

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Development Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Development branch
- `feature/*` - Feature branches
- `bugfix/*` - Bug fix branches

### Workflow

1. **Create feature branch from develop**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/user-management
   ```

2. **Make changes and commit**
   ```bash
   git add .
   git commit -m "feat: add user management interface"
   ```

3. **Push and create PR**
   ```bash
   git push origin feature/user-management
   gh pr create --base develop --head feature/user-management
   ```

4. **After PR approval, merge to develop**

5. **For production release, create PR from develop to main**

## Code Quality

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format

# Run all checks
npm run check-all
```

## Testing

```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

## Deployment

### Vercel (Recommended)

1. Connect repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to `main`

### Self-Hosted

```bash
# Build application
npm run build

# Start production server
npm start

# Or use PM2
pm2 start npm --name "earthenable-web" -- start
```

## Related Projects

- [earthenable-api](https://github.com/earthenable/earthenable-api) - FastAPI backend
- [earthenable-app](https://github.com/earthenable/earthenable-app) - React Native mobile app

## Documentation

- [CLAUDE.md](./CLAUDE.md) - Developer guidance for Claude Code
- [Backend API Docs](https://api.earthenable.org/docs) - FastAPI OpenAPI docs

## License

MIT
