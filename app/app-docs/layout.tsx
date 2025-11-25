/**
 * App Documentation Layout
 * Shared layout for all documentation pages with language toggle and navigation
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Download, HelpCircle, FileText } from "lucide-react";
import { LanguageToggle } from "@/src/components/docs/LanguageToggle";
import { LanguageProvider, useLanguage } from "@/src/contexts/LanguageContext";
import { PublicPageHeader } from "@/src/components/layout/PublicPageHeader";

function AppDocsLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { language, setLanguage } = useLanguage();

  const navItems = [
    { href: "/app-docs", label: "Overview", icon: BookOpen },
    { href: "/app-docs/installation", label: "Installation", icon: Download },
    { href: "/app-docs/user-guide", label: "User Guide", icon: FileText },
    { href: "/app-docs/faq", label: "FAQ", icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Header */}
      <PublicPageHeader
        subtitle="Docs"
        hideSubtitleOnMobile={true}
        rightContent={
          <>
            <LanguageToggle currentLanguage={language} onLanguageChange={setLanguage} />
            <Link
              href="/"
              className="text-xs sm:text-sm font-medium text-text-secondary transition-colors hover:text-primary whitespace-nowrap"
            >
              Hub
            </Link>
          </>
        }
      />

      {/* Mobile/Tablet Navigation - Horizontal Tabs */}
      <div className="md:hidden border-b border-border-light bg-white sticky top-[56px] z-30">
        <nav className="overflow-x-auto">
          <div className="flex gap-1 px-2 py-2 min-w-max">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? "bg-primary text-white"
                      : "text-text-secondary bg-background-light hover:bg-primary/10 hover:text-text-primary"
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      <div className="flex overflow-hidden">
        {/* Sidebar Navigation - Desktop Only */}
        <aside className="hidden w-64 flex-shrink-0 border-r border-border-light bg-white p-6 md:block">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-white"
                      : "text-text-secondary hover:bg-background-light hover:text-text-primary"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* App Version Info */}
          <div className="mt-8 rounded-lg bg-background-light p-4">
            <p className="text-xs font-semibold text-text-secondary">CURRENT VERSION</p>
            <p className="mt-1 text-sm font-bold text-text-primary">v1.0.0</p>
            <p className="mt-1 text-xs text-text-secondary">Released November 2025</p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 px-2 sm:px-4 md:px-12 py-2 overflow-x-hidden">
          <div className="mx-auto max-w-7xl w-full">{children}</div>

          {/* Footer */}
          <footer className="mx-auto mt-12 sm:mt-16 max-w-4xl w-full border-t border-border-light pt-6 sm:pt-8">
            <div className="flex flex-col items-center justify-between gap-3 sm:gap-4 text-xs sm:text-sm text-text-secondary sm:flex-row">
              <p className="text-center sm:text-left break-words">
                For support, contact{" "}
                <a href="mailto:support@earthenable.org" className="text-primary hover:underline">
                  support@earthenable.org
                </a>
              </p>
              <p className="text-center sm:text-right break-words">
                © {new Date().getFullYear()} EarthEnable. All rights reserved.
              </p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default function AppDocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <AppDocsLayoutContent>{children}</AppDocsLayoutContent>
    </LanguageProvider>
  );
}
