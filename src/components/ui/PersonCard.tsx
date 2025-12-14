"use client";

/**
 * PersonCard Component
 *
 * Reusable component for displaying a person's profile card.
 * Used in reporting structures, team lists, assignee displays, etc.
 */

import { forwardRef } from "react";
import Link from "next/link";
import { cn } from "@/src/lib/theme";

export interface PersonCardProps {
  /** Unique identifier for the person */
  id?: string;
  /** Person's display name */
  name?: string | null;
  /** Person's email address */
  email?: string | null;
  /** Subtitle text (role, department, title, etc.) */
  subtitle?: string | null;
  /** Profile picture URL */
  picture?: string | null;
  /** Avatar background color variant */
  variant?: "primary" | "secondary" | "info" | "success" | "warning" | "accent";
  /** Size of the component */
  size?: "sm" | "md" | "lg";
  /** Whether to show a link to the person's profile */
  showProfileLink?: boolean;
  /** Base path for profile links (default: /dashboard/users) */
  profileBasePath?: string;
  /** Additional CSS classes */
  className?: string;
  /** Click handler for the entire card */
  onClick?: () => void;
}

const variantStyles = {
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary/10 text-secondary",
  info: "bg-status-info/10 text-status-info",
  success: "bg-green/10 text-green",
  warning: "bg-status-warning/10 text-status-warning",
  accent: "bg-accent/10 text-accent",
};

const sizeStyles = {
  sm: {
    container: "p-2 gap-2",
    avatar: "w-8 h-8 text-xs",
    name: "text-xs",
    subtitle: "text-[10px]",
    icon: "w-3 h-3",
  },
  md: {
    container: "p-3 gap-3",
    avatar: "w-10 h-10 text-sm",
    name: "text-sm",
    subtitle: "text-xs",
    icon: "w-4 h-4",
  },
  lg: {
    container: "p-4 gap-4",
    avatar: "w-12 h-12 text-base",
    name: "text-base",
    subtitle: "text-sm",
    icon: "w-5 h-5",
  },
};

/**
 * PersonCard - A reusable component for displaying person information
 */
export const PersonCard = forwardRef<HTMLDivElement, PersonCardProps>(
  (
    {
      id,
      name,
      email,
      subtitle,
      picture,
      variant = "primary",
      size = "md",
      showProfileLink = true,
      profileBasePath = "/dashboard/users",
      className,
      onClick,
    },
    ref
  ) => {
    const displayName = name || email || "Unknown";
    const initial = displayName.charAt(0).toUpperCase();
    const styles = sizeStyles[size];

    const cardContent = (
      <>
        {/* Avatar */}
        {picture ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={picture}
            alt={displayName}
            className={cn("rounded-full object-cover flex-shrink-0", styles.avatar)}
          />
        ) : (
          <div
            className={cn(
              "rounded-full flex items-center justify-center flex-shrink-0 font-bold",
              styles.avatar,
              variantStyles[variant]
            )}
          >
            {initial}
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className={cn("font-medium text-text-primary truncate", styles.name)}>
            {displayName}
          </div>
          {subtitle && (
            <div className={cn("text-text-secondary truncate", styles.subtitle)}>{subtitle}</div>
          )}
        </div>

        {/* Profile Link Icon */}
        {showProfileLink && id && (
          <Link
            href={`${profileBasePath}/${id}`}
            className="text-primary hover:text-primary/80 flex-shrink-0"
            title="View Profile"
            onClick={(e) => e.stopPropagation()}
          >
            <svg className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </Link>
        )}
      </>
    );

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center bg-background-secondary rounded-lg",
          styles.container,
          onClick && "cursor-pointer hover:bg-background-secondary/80 transition-colors",
          className
        )}
        onClick={onClick}
      >
        {cardContent}
      </div>
    );
  }
);

PersonCard.displayName = "PersonCard";

export default PersonCard;
