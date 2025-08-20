import { getEnvironmentConfig } from '@/environments/config';

export interface MicroFrontendConfig {
  scope: string;
  module: string;
  url: string;
  version?: string;
}

const envConfig = getEnvironmentConfig();

export const MICRO_FRONTENDS = {
  reactNav: {
    scope: 'reactnav',
    module: './App',
    url: envConfig.NAVIGATION_UI_URL,
    version: envConfig.APP_VERSION
  },
  extractor: {
    scope: 'extracator',
    module: './App',
    url: envConfig.CONTENT_UI_URL,
    version: envConfig.APP_VERSION
  },
} as const;
