/**
 * Metadata Utilities
 *
 * Centralized utilities for generating SEO metadata, OpenGraph tags,
 * and social sharing previews for EarthEnable Hub pages.
 */

import type { Metadata } from "next";

// ==================== Constants ====================

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "EarthEnable Hub";
const COMPANY_DOMAIN = process.env.NEXT_PUBLIC_COMPANY_DOMAIN || "earthenable.org";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://hub.earthenable.org";

const DEFAULT_DESCRIPTION =
  "Admin and manager web platform for EarthEnable field operations management across Rwanda, Kenya, Zambia, and India.";

const DEFAULT_KEYWORDS = [
  "EarthEnable",
  "field operations",
  "task management",
  "affordable housing",
  "floor installation",
  "Rwanda",
  "Kenya",
  "Zambia",
  "India",
  "admin dashboard",
];

// ==================== Types ====================

export interface PageMetadataOptions {
  /** Page title (will be appended with app name) */
  title: string;
  /** Page description for SEO and social sharing */
  description?: string;
  /** Canonical path (e.g., "/dashboard/tasks") */
  path?: string;
  /** Custom OpenGraph image path (relative to public folder) */
  ogImage?: string;
  /** Additional keywords for SEO */
  keywords?: string[];
  /** Prevent indexing (for admin-only pages) */
  noIndex?: boolean;
}

// ==================== Utility Functions ====================

/**
 * Get the full URL for a path
 */
export function getFullUrl(path: string = ""): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_URL}${cleanPath}`;
}

/**
 * Get the OpenGraph image URL
 * Uses Next.js dynamic OG image generation by default
 */
export function getOgImageUrl(imagePath?: string): string {
  if (imagePath) {
    return getFullUrl(imagePath.startsWith("/") ? imagePath : `/${imagePath}`);
  }
  // Default uses Next.js dynamic OG image generation (app/opengraph-image.tsx)
  return getFullUrl("/opengraph-image");
}

/**
 * Generate metadata for a page
 *
 * @example
 * // In a page.tsx file:
 * export const metadata = generatePageMetadata({
 *   title: "Tasks",
 *   description: "Manage and track field tasks",
 *   path: "/dashboard/tasks",
 * });
 */
export function generatePageMetadata(options: PageMetadataOptions): Metadata {
  const {
    title,
    description = DEFAULT_DESCRIPTION,
    path = "",
    ogImage,
    keywords = [],
    noIndex = false,
  } = options;

  const fullTitle = `${title} | ${APP_NAME}`;
  const canonicalUrl = getFullUrl(path);
  const ogImageUrl = getOgImageUrl(ogImage);

  const metadata: Metadata = {
    title: fullTitle,
    description,
    keywords: [...DEFAULT_KEYWORDS, ...keywords],
    authors: [{ name: "EarthEnable", url: `https://${COMPANY_DOMAIN}` }],
    creator: "EarthEnable",
    publisher: "EarthEnable",

    // Canonical URL
    alternates: {
      canonical: canonicalUrl,
    },

    // OpenGraph
    openGraph: {
      type: "website",
      locale: "en_US",
      url: canonicalUrl,
      siteName: APP_NAME,
      title: fullTitle,
      description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${title} - ${APP_NAME}`,
        },
      ],
    },

    // Twitter Card
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImageUrl],
      creator: "@EarthEnable",
    },

    // Robots
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
  };

  return metadata;
}

/**
 * Base metadata for the root layout
 * This provides defaults that can be overridden by page-specific metadata
 */
export const rootMetadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: DEFAULT_KEYWORDS,
  authors: [{ name: "EarthEnable", url: `https://${COMPANY_DOMAIN}` }],
  creator: "EarthEnable",
  publisher: "EarthEnable",

  // Icons
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },

  // Manifest
  manifest: "/manifest.json",

  // OpenGraph defaults
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: APP_NAME,
    title: APP_NAME,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: getOgImageUrl(),
        width: 1200,
        height: 630,
        alt: APP_NAME,
      },
    ],
  },

  // Twitter Card defaults
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description: DEFAULT_DESCRIPTION,
    images: [getOgImageUrl()],
    creator: "@EarthEnable",
  },

  // Robots - allow indexing of public pages
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Verification (add your verification codes here)
  // verification: {
  //   google: "your-google-verification-code",
  // },

  // App-specific
  applicationName: APP_NAME,
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

// ==================== Page-Specific Metadata Generators ====================

/**
 * Pre-defined metadata for common pages
 */
export const pageMetadata = {
  signIn: generatePageMetadata({
    title: "Sign In",
    description: "Sign in to EarthEnable Hub to manage field operations and tasks.",
    path: "/auth/signin",
  }),

  dashboard: generatePageMetadata({
    title: "Dashboard",
    description: "Overview of field operations, tasks, and team performance.",
    path: "/dashboard",
    noIndex: true, // Protected page
  }),

  tasks: generatePageMetadata({
    title: "Tasks",
    description: "Manage and track field tasks across all regions.",
    path: "/dashboard/tasks",
    keywords: ["tasks", "field work", "assignments"],
    noIndex: true,
  }),

  users: generatePageMetadata({
    title: "Users",
    description: "Manage team members, roles, and permissions.",
    path: "/dashboard/users",
    keywords: ["users", "team", "permissions"],
    noIndex: true,
  }),

  callCenter: generatePageMetadata({
    title: "Call Center",
    description: "Manage calls, view statistics, and handle customer communications.",
    path: "/dashboard/call-center",
    keywords: ["call center", "communications", "softphone"],
    noIndex: true,
  }),

  analytics: generatePageMetadata({
    title: "Analytics",
    description: "View performance metrics, sync statistics, and operational insights.",
    path: "/dashboard/analytics",
    keywords: ["analytics", "metrics", "reports"],
    noIndex: true,
  }),

  expenses: generatePageMetadata({
    title: "Expenses",
    description: "Track and manage expense requests and approvals.",
    path: "/dashboard/expenses",
    keywords: ["expenses", "payments", "approvals"],
    noIndex: true,
  }),

  settings: generatePageMetadata({
    title: "Settings",
    description: "Configure your profile and application settings.",
    path: "/dashboard/settings",
    noIndex: true,
  }),

  privacyPolicy: generatePageMetadata({
    title: "Privacy Policy",
    description: "EarthEnable Hub privacy policy and data handling practices.",
    path: "/privacy-policy",
  }),

  termsOfService: generatePageMetadata({
    title: "Terms of Service",
    description: "EarthEnable Hub terms of service and usage agreement.",
    path: "/terms-of-service",
  }),
};
