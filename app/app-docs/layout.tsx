/**
 * App Documentation Layout
 * Shared layout for all documentation pages with language toggle and navigation
 */

"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { BookOpen, Download, HelpCircle, FileText } from "lucide-react";
import { LanguageToggle } from "@/src/components/docs/LanguageToggle";
import { useLanguage } from "@/src/hooks/useLanguage";

export default function AppDocsLayout({ children }: { children: React.ReactNode }) {
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
      <header className="sticky top-0 z-40 w-full border-b border-border-light bg-white shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link href="/app-docs" className="flex items-center gap-3 hover:opacity-80">
            <Image src="/logo.svg" alt="EarthEnable" width={120} height={69} priority />
            <span className="hidden text-lg font-semibold text-text-primary sm:inline">
              App Docs
            </span>
          </Link>

          {/* Language Toggle */}
          <div className="flex items-center gap-4">
            <LanguageToggle currentLanguage={language} onLanguageChange={setLanguage} />
            <Link href="/" className="text-sm font-medium text-text-secondary hover:text-primary">
              Back to Hub
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto flex">
        {/* Sidebar Navigation */}
        <aside className="hidden w-64 border-r border-border-light bg-white p-6 md:block">
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
            <p className="mt-1 text-xs text-text-secondary">Released January 2025</p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 px-4 py-8 md:px-12">
          <div className="mx-auto max-w-4xl">{children}</div>

          {/* Footer */}
          <footer className="mx-auto mt-16 max-w-4xl border-t border-border-light pt-8">
            <div className="flex flex-col items-center justify-between gap-4 text-sm text-text-secondary sm:flex-row">
              <p>
                For support, contact{" "}
                <a href="mailto:support@earthenable.org" className="text-primary hover:underline">
                  support@earthenable.org
                </a>
              </p>
              <p>© {new Date().getFullYear()} EarthEnable. All rights reserved.</p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
