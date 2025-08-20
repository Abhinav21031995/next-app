export type Environment = 'local' | 'qa' | 'staging' | 'production';

export interface EnvironmentConfig {
  NODE_ENV: string;
  APP_ENV: Environment;
  APP_NAME: string;
  APP_VERSION: string;
  APP_URL: string;
  NAVIGATION_UI_URL: string;
  CONTENT_UI_URL: string;
  ENABLE_DEBUG_MODE: boolean;
}
