/**
 * PublicPageHeader Component
 * Reusable header for public pages (app-docs, terms-of-service, privacy-policy)
 * Provides consistent branding and navigation across public pages
 */

import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";

export interface PublicPageHeaderProps {
  /**
   * Navigation items to display on the right side
   * Can be links, buttons, language toggles, etc.
   */
  rightContent?: ReactNode;

  /**
   * Optional subtitle or page identifier to show next to logo
   */
  subtitle?: string;

  /**
   * Show subtitle only on larger screens
   * @default true
   */
  hideSubtitleOnMobile?: boolean;
}

export function PublicPageHeader({
  rightContent,
  subtitle,
  hideSubtitleOnMobile = true,
}: PublicPageHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border-light bg-white shadow-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <Image src="/logo.svg" alt="EarthEnable" width={120} height={69} priority />
          {subtitle && (
            <span
              className={`text-lg font-semibold text-text-primary ${
                hideSubtitleOnMobile ? "hidden sm:inline" : ""
              }`}
            >
              {subtitle}
            </span>
          )}
        </Link>

        {/* Right Side Content */}
        {rightContent && <div className="flex items-center gap-4">{rightContent}</div>}
      </div>
    </header>
  );
}
