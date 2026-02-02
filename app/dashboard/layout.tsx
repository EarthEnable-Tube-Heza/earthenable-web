"use client";

/**
 * Dashboard Layout
 *
 * Layout wrapper for all dashboard pages with sidebar and header.
 * Includes SidebarProvider for managing sidebar state.
 */

import { useRequireAuth } from "@/src/lib/auth";
import { SidebarProvider } from "@/src/contexts/SidebarContext";
import { PageHeaderProvider } from "@/src/contexts/PageHeaderContext";
import { Sidebar } from "@/src/components/dashboard/Sidebar";
import { Header } from "@/src/components/dashboard/Header";
import { EntitySelectionModal } from "@/src/components/dashboard/EntitySelectionModal";
import { CallCenterProvider } from "@/src/hooks/useAfricasTalkingClient";
import { FloatingSoftphone } from "@/src/components/call-center";
import { SessionExpiryModal } from "@/src/components/ui";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Protect dashboard routes - redirect to sign-in if not authenticated
  const { isAuthenticated, isLoading, sessionExpired } = useRequireAuth();

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

  // Don't render dashboard if not authenticated, UNLESS session just expired
  // (keep the layout visible so the modal can display over it)
  if (!isAuthenticated && !sessionExpired) {
    return null;
  }

  return (
    <SidebarProvider>
      <PageHeaderProvider>
        <CallCenterProvider options={{ autoInitialize: false }}>
          <div className="flex min-h-screen bg-background-primary">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Header */}
              <Header />

              {/* Page Content */}
              <main className="flex-1 p-4 md:p-6 overflow-x-auto">{children}</main>
            </div>

            {/* Entity Selection Modal - Shows when user hasn't selected an entity */}
            <EntitySelectionModal />

            {/* Floating Softphone - Always accessible from dashboard */}
            <FloatingSoftphone />

            {/* Session Expiry Modal - Shows when session is expiring or expired */}
            <SessionExpiryModal />
          </div>
        </CallCenterProvider>
      </PageHeaderProvider>
    </SidebarProvider>
  );
}
