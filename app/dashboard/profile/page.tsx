'use client';

/**
 * Profile Page
 *
 * Displays current user's profile information and account details.
 */

import { useAuth } from '@/src/lib/auth';
import { UserRoleLabels } from '@/src/types/user';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';

export default function ProfilePage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-text-secondary mt-2">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 text-center">
        <p className="text-status-error">Unable to load profile. Please try again.</p>
      </div>
    );
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold text-text-primary">
          My Profile
        </h1>
        <p className="text-text-secondary mt-2">
          View and manage your account information
        </p>
      </div>

      {/* Profile Overview Card */}
      <Card variant="elevated" padding="lg">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Profile Picture */}
          <div className="flex-shrink-0">
            {user.picture ? (
              <img
                src={user.picture}
                alt={user.name || user.email}
                className="w-32 h-32 rounded-full border-4 border-primary/20 object-cover"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-primary text-white flex items-center justify-center font-heading font-bold text-4xl border-4 border-primary/20">
                {user.name?.[0] || user.email[0].toUpperCase()}
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <div>
                <h2 className="text-2xl font-heading font-bold text-text-primary">
                  {user.name || 'No name set'}
                </h2>
                <p className="text-text-secondary">{user.email}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant={user.is_active ? 'success' : 'error'} size="lg">
                  {user.is_active ? 'Active' : 'Inactive'}
                </Badge>
                <Badge
                  variant={
                    user.role === 'admin' ? 'error' :
                    user.role === 'manager' ? 'info' :
                    'success'
                  }
                  size="lg"
                >
                  {UserRoleLabels[user.role]}
                </Badge>
                {user.is_verified && (
                  <Badge variant="success" size="lg">
                    ✓ Verified
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-text-secondary">User ID:</span>
                <p className="text-text-primary font-mono text-xs break-all mt-1">
                  {user.id}
                </p>
              </div>
              {user.created_at && (
                <div>
                  <span className="text-text-secondary">Member Since:</span>
                  <p className="text-text-primary mt-1">
                    {formatDate(user.created_at)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Account Details */}
      <Card header="Account Details" divided padding="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Email Address
              </label>
              <div className="px-4 py-3 bg-background-light rounded-lg text-text-primary">
                {user.email}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Full Name
              </label>
              <div className="px-4 py-3 bg-background-light rounded-lg text-text-primary">
                {user.name || 'Not set'}
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Role
              </label>
              <div className="px-4 py-3 bg-background-light rounded-lg text-text-primary">
                {UserRoleLabels[user.role]}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Account Status
              </label>
              <div className="px-4 py-3 bg-background-light rounded-lg">
                <span className={user.is_active ? 'text-status-success' : 'text-status-error'}>
                  {user.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Google Account Info */}
      {user.google_id && (
        <Card header="Connected Accounts" divided padding="lg">
          <div className="flex items-center gap-4 p-4 bg-background-light rounded-lg">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-medium text-text-primary">Google Account</p>
              <p className="text-sm text-text-secondary">
                Connected and verified
              </p>
            </div>
            <Badge variant="success">Connected</Badge>
          </div>
        </Card>
      )}

      {/* Security Notice */}
      <Card padding="md">
        <div className="flex items-start gap-3 p-4 bg-status-info/10 rounded-lg">
          <svg className="w-5 h-5 text-status-info flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <p className="font-medium text-status-info mb-1">Profile Management</p>
            <p className="text-sm text-status-info/80">
              Your profile information is synced from your Google account. To update your name or picture,
              please update your Google account settings. Role and permissions are managed by administrators.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
