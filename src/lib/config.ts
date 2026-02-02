/**
 * Environment Configuration
 *
 * Type-safe access to environment variables with validation.
 * All public environment variables must be prefixed with NEXT_PUBLIC_
 */

/**
 * Application configuration
 */
interface Config {
  // API Configuration
  api: {
    baseUrl: string;
    version: string;
    timeout: number;
  };

  // Google OAuth Configuration
  google: {
    clientId: string;
  };

  // App Configuration
  app: {
    name: string;
    companyDomain: string;
  };

  // Token Management Configuration
  token: {
    refreshThreshold: number; // minutes before expiry to start silent refresh
    criticalThreshold: number; // minutes before expiry to show warning modal
  };

  // Session Activity Detection
  session: {
    activityIdleThreshold: number; // seconds — user is "idle" after this long without interaction
    activityThrottleInterval: number; // seconds — throttle DOM activity event tracking
    refreshCheckInterval: number; // seconds — how often to check if token needs refresh
  };

  // Environment
  isDevelopment: boolean;
  isProduction: boolean;
}

/**
 * Application configuration object
 *
 * IMPORTANT: NEXT_PUBLIC_* variables must be accessed directly as process.env.NEXT_PUBLIC_*
 * to be embedded at build time. Using functions or variables prevents Next.js from
 * embedding the values, causing runtime lookups to fail.
 */
export const config: Config = {
  api: {
    // Direct access required for Next.js to embed at build time
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000",
    version: process.env.NEXT_PUBLIC_API_VERSION || "v1",
    timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || "30000", 10),
  },

  google: {
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
  },

  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || "EarthEnable Hub",
    companyDomain: process.env.NEXT_PUBLIC_COMPANY_DOMAIN || "earthenable.org",
  },

  token: {
    // SECURITY: Web dashboard uses stricter token expiration than mobile app
    // Mobile app: 7-day refresh threshold (offline capability needed)
    // Web dashboard: 10-minute refresh threshold (no offline needed, higher security)
    refreshThreshold: parseInt(process.env.NEXT_PUBLIC_TOKEN_REFRESH_THRESHOLD || "10", 10),

    // Show critical warning when token is about to expire
    // Default: 2 minutes (gives user time to save work before session ends)
    criticalThreshold: parseInt(process.env.NEXT_PUBLIC_TOKEN_CRITICAL_THRESHOLD || "2", 10),
  },

  session: {
    // User is considered "idle" after this many seconds without DOM interaction.
    // Active users get silent token refresh; idle users see the expiry modal.
    // Default: 300 seconds (5 minutes)
    activityIdleThreshold: parseInt(process.env.NEXT_PUBLIC_ACTIVITY_IDLE_THRESHOLD || "300", 10),

    // Throttle DOM activity event tracking to avoid excessive updates.
    // Default: 30 seconds
    activityThrottleInterval: parseInt(
      process.env.NEXT_PUBLIC_ACTIVITY_THROTTLE_INTERVAL || "30",
      10
    ),

    // How often to check whether the token needs refreshing.
    // Default: 30 seconds
    refreshCheckInterval: parseInt(process.env.NEXT_PUBLIC_REFRESH_CHECK_INTERVAL || "30", 10),
  },

  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
};

/**
 * Get full API URL
 */
export function getAPIUrl(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${config.api.baseUrl}/api/${config.api.version}/${cleanPath}`;
}

/**
 * Validate required environment variables on app startup
 */
export function validateConfig(): void {
  const requiredVars = ["NEXT_PUBLIC_API_BASE_URL", "NEXT_PUBLIC_GOOGLE_CLIENT_ID"];

  const missingVars = requiredVars.filter((key) => !process.env[key]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}\n` +
        "Please check your .env.local file."
    );
  }
}

// Note: Validation is removed from module load to prevent errors during Next.js hydration
// The Google OAuth component will show a clear error if the client ID is missing
