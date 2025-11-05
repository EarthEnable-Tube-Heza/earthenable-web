'use client';

/**
 * Dashboard Header
 *
 * Top header bar with user menu and sign out.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useTokenExpiry } from '@/src/lib/auth';
import { Menu } from '@headlessui/react';
import { cn } from '@/src/lib/theme';

export function Header() {
  const router = useRouter();
  const { user, signOut, isLoading } = useAuth();
  const { isExpiring, timeRemaining } = useTokenExpiry();
  const [isSigningOut, setIsSigningOut] = useState(false);

  /**
   * Handle sign out
   */
  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
      router.push('/auth/signin');
    } catch (error) {
      console.error('Sign out error:', error);
      setIsSigningOut(false);
    }
  };

  /**
   * Format time remaining
   */
  const formatTimeRemaining = (ms: number | null): string => {
    if (!ms) return '';
    const minutes = Math.floor(ms / 1000 / 60);
    if (minutes < 1) return 'less than 1 minute';
    if (minutes === 1) return '1 minute';
    return `${minutes} minutes`;
  };

  return (
    <header className="bg-white border-b border-border-light sticky top-0 z-50">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Page Title (can be customized per page) */}
        <div>
          <h2 className="text-xl font-heading font-bold text-text-primary">
            Dashboard
          </h2>
        </div>

        {/* Right Side: Token Warning + User Menu */}
        <div className="flex items-center gap-4">
          {/* Token Expiry Warning */}
          {isExpiring && (
            <div className="px-4 py-2 bg-status-warning/10 border border-status-warning rounded-md">
              <p className="text-status-warning text-sm font-medium">
                ⚠️ Session expires in {formatTimeRemaining(timeRemaining)}
              </p>
            </div>
          )}

          {/* User Menu */}
          {user && (
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-background-light transition-colors">
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name || user.email}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-heading font-bold text-sm">
                    {user.name?.[0] || user.email[0].toUpperCase()}
                  </div>
                )}
                <div className="text-left hidden md:block">
                  <p className="text-sm font-medium text-text-primary">
                    {user.name || user.email}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {user.role.replace('_', ' ').toUpperCase()}
                  </p>
                </div>
                <svg
                  className="w-4 h-4 text-text-secondary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </Menu.Button>

              <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-large border border-border-light overflow-hidden">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => router.push('/dashboard/profile')}
                        className={cn(
                          'flex items-center gap-3 w-full px-4 py-2 text-sm text-left',
                          active ? 'bg-background-light' : ''
                        )}
                      >
                        <span>👤</span>
                        <span>Profile</span>
                      </button>
                    )}
                  </Menu.Item>

                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => router.push('/dashboard/settings')}
                        className={cn(
                          'flex items-center gap-3 w-full px-4 py-2 text-sm text-left',
                          active ? 'bg-background-light' : ''
                        )}
                      >
                        <span>⚙️</span>
                        <span>Settings</span>
                      </button>
                    )}
                  </Menu.Item>

                  <div className="border-t border-border-light my-1" />

                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleSignOut}
                        disabled={isSigningOut}
                        className={cn(
                          'flex items-center gap-3 w-full px-4 py-2 text-sm text-left text-status-error',
                          active ? 'bg-status-error/10' : '',
                          isSigningOut ? 'opacity-50 cursor-not-allowed' : ''
                        )}
                      >
                        <span>🚪</span>
                        <span>{isSigningOut ? 'Signing out...' : 'Sign Out'}</span>
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Menu>
          )}
        </div>
      </div>
    </header>
  );
}
