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
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 sm:gap-3 px-2 sm:px-4 py-2 sm:py-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 sm:gap-3 transition-opacity hover:opacity-80 flex-shrink-0"
        >
          <div className="relative h-10 w-[69px] sm:h-[69px] sm:w-[120px]">
            <Image src="/logo.svg" alt="EarthEnable" fill className="object-contain" priority />
          </div>
          {subtitle && (
            <span
              className={`text-sm sm:text-lg font-semibold text-text-primary whitespace-nowrap ${
                hideSubtitleOnMobile ? "hidden lg:inline" : ""
              }`}
            >
              {subtitle}
            </span>
          )}
        </Link>

        {/* Right Side Content */}
        {rightContent && (
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">{rightContent}</div>
        )}
      </div>
    </header>
  );
}
