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
    refreshThreshold: number; // minutes
    criticalThreshold: number; // minutes
  };

  // Environment
  isDevelopment: boolean;
  isProduction: boolean;
}

/**
 * Get environment variable with validation
 */
function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

/**
 * Get optional environment variable
 */
function getOptionalEnvVar(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

/**
 * Get numeric environment variable
 */
function getNumericEnvVar(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (!value) return defaultValue;

  const numValue = parseInt(value, 10);
  if (isNaN(numValue)) {
    console.warn(`Invalid numeric value for ${key}, using default: ${defaultValue}`);
    return defaultValue;
  }

  return numValue;
}

/**
 * Application configuration object
 */
export const config: Config = {
  api: {
    baseUrl: getEnvVar('NEXT_PUBLIC_API_BASE_URL', 'http://localhost:8000'),
    version: getOptionalEnvVar('NEXT_PUBLIC_API_VERSION', 'v1'),
    timeout: getNumericEnvVar('NEXT_PUBLIC_API_TIMEOUT', 30000), // 30 seconds
  },

  google: {
    clientId: getOptionalEnvVar('NEXT_PUBLIC_GOOGLE_CLIENT_ID', ''),
  },

  app: {
    name: getOptionalEnvVar('NEXT_PUBLIC_APP_NAME', 'EarthEnable Hub'),
    companyDomain: getOptionalEnvVar('NEXT_PUBLIC_COMPANY_DOMAIN', 'earthenable.org'),
  },

  token: {
    // SECURITY: Web dashboard uses stricter token expiration than mobile app
    // Mobile app: 7-day refresh threshold (offline capability needed)
    // Web dashboard: 10-minute refresh threshold (no offline needed, higher security)
    refreshThreshold: getNumericEnvVar('NEXT_PUBLIC_TOKEN_REFRESH_THRESHOLD', 10),

    // Show critical warning when token is about to expire
    // Default: 2 minutes (gives user time to save work before session ends)
    criticalThreshold: getNumericEnvVar('NEXT_PUBLIC_TOKEN_CRITICAL_THRESHOLD', 2),
  },

  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};

/**
 * Get full API URL
 */
export function getAPIUrl(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${config.api.baseUrl}/api/${config.api.version}/${cleanPath}`;
}

/**
 * Validate required environment variables on app startup
 */
export function validateConfig(): void {
  const requiredVars = [
    'NEXT_PUBLIC_API_BASE_URL',
    'NEXT_PUBLIC_GOOGLE_CLIENT_ID',
  ];

  const missingVars = requiredVars.filter(key => !process.env[key]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env.local file.'
    );
  }
}

// Note: Validation is removed from module load to prevent errors during Next.js hydration
// The Google OAuth component will show a clear error if the client ID is missing
