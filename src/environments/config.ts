/**
 * Environment Configuration Loader
 * This utility helps load environment-specific configurations
 * and provides type-safe access to environment variables.
 */

import type { Environment, EnvironmentConfig } from '@/types/environment';

export type { Environment, EnvironmentConfig };

/**
 * Get the current environment from environment variables
 */
export function getCurrentEnvironment(): Environment {
  const env = process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV || 'local';
  
  switch (env) {
    case 'qa':
    case 'staging':
    case 'production':
      return env;
    default:
      return 'local';
  }
}

/**
 * Get environment-specific configuration
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  const currentEnv = getCurrentEnvironment();
  
  return {
    // Application Settings
    NODE_ENV: process.env.NODE_ENV || 'development',
    APP_ENV: currentEnv,
    APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Passport Demo',
    APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
    APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',

    // Micro Frontend URLs
    NAVIGATION_UI_URL: process.env.NEXT_PUBLIC_MICROUI_NAVIGATION_REMOTE_URL || 'http://localhost:3002/remoteEntry.js',
    CONTENT_UI_URL: process.env.NEXT_PUBLIC_MICROUI_CONTENT_REMOTE_URL || 'http://localhost:3001/remoteEntry.js',

    // Feature Flags
    ENABLE_DEBUG_MODE: process.env.NEXT_PUBLIC_ENABLE_DEBUG_MODE === 'true',
  };
}

/**
 * Check if we're in a specific environment
 */
export function isEnvironment(env: Environment): boolean {
  return getCurrentEnvironment() === env;
}

/**
 * Check if we're in development (local)
 */
export function isDevelopment(): boolean {
  return isEnvironment('local');
}

/**
 * Check if we're in production(): boolean {
  return isEnvironment('production');
}*/
