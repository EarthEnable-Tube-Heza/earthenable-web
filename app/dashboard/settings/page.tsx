"use client";

/**
 * Settings Page
 *
 * User preferences and dashboard settings.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useTokenExpiry } from "@/src/lib/auth";
import { Card } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";

export default function SettingsPage() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { timeRemaining } = useTokenExpiry();
  const [isSigningOut, setIsSigningOut] = useState(false);

  /**
   * Handle sign out all sessions
   */
  const handleSignOutAllSessions = async () => {
    if (
      !confirm("Are you sure you want to sign out of all sessions? You will need to sign in again.")
    ) {
      return;
    }

    try {
      setIsSigningOut(true);
      await signOut();
      router.push("/auth/signin");
    } catch (error) {
      console.error("Sign out error:", error);
      setIsSigningOut(false);
    }
  };

  /**
   * Format session time remaining
   */
  const formatSessionTime = (ms: number | null): string => {
    if (!ms) return "Unknown";

    const totalMinutes = Math.floor(ms / 1000 / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} minutes`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold text-text-primary">Settings</h1>
        <p className="text-text-secondary mt-2">
          Manage your dashboard preferences and account settings
        </p>
      </div>

      {/* Session Management */}
      <Card header="Session Management" divided padding="lg">
        <div className="space-y-6">
          {/* Current Session Info */}
          <div>
            <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">
              Current Session
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-background-light rounded-lg">
                <p className="text-sm text-text-secondary mb-1">Session Status</p>
                <p className="text-lg font-semibold text-status-success">Active</p>
              </div>
              <div className="p-4 bg-background-light rounded-lg">
                <p className="text-sm text-text-secondary mb-1">Time Remaining</p>
                <p className="text-lg font-semibold text-text-primary">
                  {formatSessionTime(timeRemaining)}
                </p>
              </div>
            </div>
          </div>

          {/* Session Actions */}
          <div>
            <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">
              Session Actions
            </h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" onClick={() => window.location.reload()}>
                Refresh Session
              </Button>
              <Button variant="danger" onClick={handleSignOutAllSessions} loading={isSigningOut}>
                Sign Out All Sessions
              </Button>
            </div>
          </div>

          {/* Session Security Info */}
          <div className="flex items-start gap-3 p-4 bg-status-info/10 rounded-lg">
            <svg
              className="w-5 h-5 text-status-info flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <p className="font-medium text-status-info mb-1">Security Notice</p>
              <p className="text-sm text-status-info/80">
                For security reasons, admin dashboard sessions expire after 1 hour of inactivity.
                You&apos;ll receive a warning 10 minutes before expiration. Your session will be
                automatically refreshed if you remain active.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Appearance Settings */}
      <Card header="Appearance" divided padding="lg">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-heading font-semibold text-text-primary mb-2">Theme</h3>
            <p className="text-sm text-text-secondary mb-4">
              Customize the dashboard appearance to match your preferences.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Light Theme (Default) */}
              <div className="p-4 border-2 border-primary bg-white rounded-lg cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-text-primary">Light</span>
                  <div className="w-4 h-4 rounded-full bg-primary" />
                </div>
                <div className="space-y-2">
                  <div className="h-2 bg-background-light rounded" />
                  <div className="h-2 bg-background-light rounded w-3/4" />
                </div>
              </div>

              {/* Dark Theme (Coming Soon) */}
              <div className="p-4 border-2 border-border-light bg-gray-100 rounded-lg opacity-50 cursor-not-allowed">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-text-secondary">Dark</span>
                  <span className="text-xs text-text-secondary">Soon</span>
                </div>
                <div className="space-y-2">
                  <div className="h-2 bg-gray-300 rounded" />
                  <div className="h-2 bg-gray-300 rounded w-3/4" />
                </div>
              </div>

              {/* Auto Theme (Coming Soon) */}
              <div className="p-4 border-2 border-border-light bg-gray-100 rounded-lg opacity-50 cursor-not-allowed">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-text-secondary">Auto</span>
                  <span className="text-xs text-text-secondary">Soon</span>
                </div>
                <div className="space-y-2">
                  <div className="h-2 bg-gray-300 rounded" />
                  <div className="h-2 bg-gray-300 rounded w-3/4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Notification Preferences */}
      <Card header="Notifications" divided padding="lg">
        <div className="space-y-4">
          <div className="flex items-start justify-between p-4 bg-background-light rounded-lg">
            <div className="flex-1">
              <p className="font-medium text-text-primary mb-1">Session Expiry Warnings</p>
              <p className="text-sm text-text-secondary">
                Get notified when your session is about to expire
              </p>
            </div>
            <div className="flex items-center">
              <div className="w-12 h-6 bg-primary rounded-full relative flex-shrink-0 ml-4">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </div>
            </div>
          </div>

          <div className="flex items-start justify-between p-4 bg-background-light rounded-lg opacity-50">
            <div className="flex-1">
              <p className="font-medium text-text-secondary mb-1">Email Notifications</p>
              <p className="text-sm text-text-secondary">
                Receive email updates about important events
              </p>
            </div>
            <div className="flex items-center">
              <span className="text-xs text-text-secondary mr-2">Coming soon</span>
            </div>
          </div>

          <div className="flex items-start justify-between p-4 bg-background-light rounded-lg opacity-50">
            <div className="flex-1">
              <p className="font-medium text-text-secondary mb-1">Browser Push Notifications</p>
              <p className="text-sm text-text-secondary">Get real-time updates in your browser</p>
            </div>
            <div className="flex items-center">
              <span className="text-xs text-text-secondary mr-2">Coming soon</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Data & Privacy */}
      <Card header="Data & Privacy" divided padding="lg">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-heading font-semibold text-text-primary mb-2">
              Data Collection
            </h3>
            <p className="text-sm text-text-secondary mb-4">
              We collect minimal data necessary to provide dashboard functionality. Your data is
              securely stored and never shared with third parties.
            </p>
          </div>

          <div className="flex items-start gap-3 p-4 bg-background-light rounded-lg">
            <svg
              className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <p className="font-medium text-text-primary mb-1">Your data is secure</p>
              <p className="text-sm text-text-secondary">
                All data is encrypted in transit and at rest. We follow industry best practices for
                data security and privacy protection.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* About */}
      <Card header="About EarthEnable Dashboard" divided padding="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-text-secondary mb-1">Version</p>
              <p className="text-text-primary font-mono">v1.0.0</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary mb-1">Environment</p>
              <p className="text-text-primary font-mono">
                {process.env.NEXT_PUBLIC_APP_ENV || "development"}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-border-light">
            <p className="text-sm text-text-secondary">
              EarthEnable Dashboard is built to support dignified, affordable housing in rural
              Africa through eco-friendly sustainable construction. Empowering field teams to
              deliver quality at scale.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
