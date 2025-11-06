'use client';

import Link from 'next/link';
import { useAuth } from '@/src/lib/auth';

export default function Home() {
  const { user, isLoading } = useAuth();

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background-primary">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-text-secondary mt-4">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background-primary p-24">
      <div className="max-w-5xl w-full items-center justify-between font-heading text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">
          EarthEnable Dashboard
        </h1>
        <p className="text-2xl text-text-secondary font-body mb-8">
          Admin and manager web dashboard for field operations management
        </p>

        {/* Show different buttons based on auth status */}
        {user ? (
          <Link
            href="/dashboard"
            className="inline-block px-8 py-3 bg-primary text-white font-heading font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-medium hover:shadow-large"
          >
            Go to Dashboard
          </Link>
        ) : (
          <Link
            href="/auth/signin"
            className="inline-block px-8 py-3 bg-primary text-white font-heading font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-medium hover:shadow-large"
          >
            Sign In with Google
          </Link>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white rounded-lg p-6 shadow-medium">
            <h3 className="text-xl font-heading font-bold text-secondary mb-2">
              User Management
            </h3>
            <p className="text-text-secondary font-body">
              View, search, and manage user roles and permissions
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-medium">
            <h3 className="text-xl font-heading font-bold text-secondary mb-2">
              Form Configuration
            </h3>
            <p className="text-text-secondary font-body">
              Manage TaskSubject-to-FormYoula form mappings
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-medium">
            <h3 className="text-xl font-heading font-bold text-secondary mb-2">
              Analytics & Stats
            </h3>
            <p className="text-text-secondary font-body">
              Department and jurisdiction performance dashboards
            </p>
          </div>
        </div>

        <div className="mt-12">
          <p className="text-sm text-text-disabled">
            Next.js + TypeScript + Tailwind CSS + TanStack Query
          </p>
        </div>
      </div>
    </div>
  );
}
