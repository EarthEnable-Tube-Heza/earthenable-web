'use client';

/**
 * Sign In Page
 *
 * Google OAuth authentication page for EarthEnable Dashboard.
 */

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { useAuth } from '@/src/lib/auth';
import { config } from '@/src/lib/config';

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, isAuthenticated, isLoading, error: authError } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const redirect = searchParams.get('redirect') || '/dashboard';
      router.push(redirect);
    }
  }, [isAuthenticated, isLoading, router, searchParams]);

  /**
   * Handle successful Google OAuth
   */
  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setIsSigningIn(true);
      setError(null);

      if (!credentialResponse.credential) {
        throw new Error('No credential received from Google');
      }

      // Sign in with Google token
      await signIn(credentialResponse.credential);

      // Redirect to intended destination or dashboard
      const redirect = searchParams.get('redirect') || '/dashboard';
      router.push(redirect);
    } catch (err: any) {
      console.error('Sign in error:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to sign in. Please try again.');
      setIsSigningIn(false);
    }
  };

  /**
   * Handle Google OAuth error
   */
  const handleGoogleError = () => {
    setError('Google sign-in was cancelled or failed. Please try again.');
    setIsSigningIn(false);
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-primary">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render sign-in if already authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  // Get client ID directly from environment variable
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || config.google.clientId;

  if (!clientId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-primary px-4">
        <div className="bg-white rounded-lg shadow-medium p-8 max-w-md">
          <h2 className="text-2xl font-heading font-bold text-status-error mb-4">
            Configuration Error
          </h2>
          <p className="text-text-secondary mb-4">
            Google Client ID is not configured. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID in your .env.local file.
          </p>
          <p className="text-text-disabled text-sm">
            Contact your system administrator for assistance.
          </p>
        </div>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="flex min-h-screen items-center justify-center bg-background-primary px-4">
        <div className="w-full max-w-md">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Image
                src="/logo.svg"
                alt="EarthEnable Logo"
                width={200}
                height={115}
                priority
                className="h-auto"
              />
            </div>
            <p className="text-xl text-text-secondary font-body">
              Dashboard Sign In
            </p>
          </div>

          {/* Sign In Card */}
          <div className="bg-white rounded-lg shadow-medium p-8">
            <h2 className="text-2xl font-heading font-bold text-text-primary mb-6 text-center">
              Welcome Back
            </h2>

            <p className="text-text-secondary mb-6 text-center">
              Sign in with your Google account to access the EarthEnable admin dashboard.
            </p>

            {/* Error Message */}
            {(error || authError) && (
              <div className="mb-6 p-4 bg-status-error/10 border border-status-error rounded-md">
                <p className="text-status-error text-sm">{error || authError}</p>
              </div>
            )}

            {/* Google Sign In Button */}
            <div className="flex justify-center">
              {!isSigningIn ? (
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap={false}
                  size="large"
                  text="signin_with"
                  shape="rectangular"
                  logo_alignment="left"
                />
              ) : (
                <div className="px-8 py-3 bg-background-light rounded-md text-text-secondary">
                  Signing you in...
                </div>
              )}
            </div>

            {isSigningIn && (
              <div className="mt-4 text-center">
                <p className="text-text-secondary text-sm">Signing you in...</p>
              </div>
            )}

            {/* Info Note */}
            <div className="mt-6 p-4 bg-background-light rounded-md">
              <p className="text-text-secondary text-xs text-center">
                <strong>Note:</strong> Only authorized @{config.app.companyDomain} accounts can access this dashboard.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-text-disabled text-sm">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
