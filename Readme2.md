# Next.js Host App - Microfrontend Implementation

## Overview
This Next.js application serves as the host container for the microfrontend architecture, integrating remote components from react-nav and extractor applications.

## Recent Updates (August 2025)

### 1. Popup Dialog Enhancements
- Fixed scrollbar stability issues
- Added hardware acceleration
- Improved visual presentation
- Enhanced user experience

### 2. State Management Improvements
- Implemented SelectionsContext
- Added cross-microfrontend communication
- Enhanced state persistence
```typescript
interface SelectionsContextType {
  selections: {
    categories: string[];
    geographies: string[];
  };
  setSelections: (selections: Selections) => void;
}
```

### 3. Performance Optimizations
- Implemented proper memoization
- Added cleanup in useEffect hooks
- Optimized re-renders
- Enhanced error boundaries

## Key Configurations

### 1. Module Federation Setup (next.config.ts)
```javascript
const NextFederationPlugin = require('@module-federation/nextjs-mf');

const remotes = {
  reactnav: `reactnav@http://localhost:3002/remoteEntry.js`,
  extractor: `extractor@http://localhost:3001/remoteEntry.js`
};

module.exports = {
  webpack(config, options) {
    config.plugins.push(
      new NextFederationPlugin({
        name: 'next-app',
        remotes,
        filename: 'static/chunks/remoteEntry.js',
        shared: {
          react: {
            singleton: true,
            requiredVersion: '^18.2.0',
            eager: false,
            strictVersion: false
          },
          'react-dom': {
            singleton: true,
            requiredVersion: '^18.2.0',
            eager: false,
            strictVersion: false
          }
        }
      })
    );
    return config;
  }
};
```

### 2. Package.json Dependencies
```json
{
  "dependencies": {
    "next": "14.0.3",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@module-federation/nextjs-mf": "^7.0.8"
  }
}
```

## Remote Components Integration

### 1. Dynamic Remote Component Loading
```typescript
// Example of loading a remote component
const RemoteComponent = dynamic(() => import('reactnav/App'), {
  ssr: false,
  loading: () => <div>Loading Navigation...</div>
});
```

## Configuration Notes

### Port Configuration
- Running on port 3000 (default Next.js port)
- Connects to:
  - react-nav on port 3002
  - extractor on port 3001

### React Version Compatibility
- Using React ^18.2.0 for compatibility with remote apps
- Configured as singleton in module federation
- Strict version checking disabled for flexibility
- Eager loading disabled to prevent shared module consumption errors

### Development Instructions

1. Installation:
```bash
npm cache clean --force
rm -rf node_modules
rm package-lock.json
npm install
```

2. Development Server:
```bash
npm run dev    # Runs on port 3000
```

3. Production Build:
```bash
npm run build
npm start
```

### Important Considerations
1. Remote App Dependencies:
   - Start remote apps (react-nav and extractor) before starting next-app
   - Ensure all apps use compatible React versions (^18.2.0)

2. Error Handling:
   - Implement proper loading states for remote components
   - Handle remote component loading failures gracefully
   - Monitor webpack chunk loading errors

3. Development Workflow:
   - Clear browser cache if changes aren't reflecting
   - Use `npm install --force` if needed for dependency conflicts
   - Check remote entry points availability in browser network tab

4. Performance Optimization:
   - Monitor chunk sizes and loading times
   - Implement proper code splitting
   - Use React.lazy and Suspense for component loading

5. Deployment Considerations:
   - Update remote URLs for production environment
   - Ensure CORS is properly configured
   - Implement proper health checks for remote apps

## Overview
This document details the changes made to implement microfrontend host functionality in the Next.js application, including environment configuration, module federation setup, and React version management.

## Core Files and Their Roles

### 1. next.config.ts
**Role**: Main configuration file for Next.js with webpack module federation setup and environment-aware configuration.

```typescript
import type { NextConfig } from 'next';
import type { Configuration, WebpackPluginInstance } from 'webpack';

const { ModuleFederationPlugin } = require('webpack').container;
const deps = require('./package.json').dependencies;

const remotes = {
  'navigation-ui': process.env.NEXT_PUBLIC_MICROUI_NAVIGATION_REMOTE_URL || 'http://localhost:3002/remoteEntry.js',
  'content-ui': process.env.NEXT_PUBLIC_MICROUI_CONTENT_REMOTE_URL || 'http://localhost:3001/remoteEntry.js',
};

const nextConfig: NextConfig = {
  // Use standalone output for Azure App Service
  output: 'standalone',
  
  // Required for static export
  trailingSlash: true,
  images: {
    unoptimized: true,
  },

  webpack: (config: Configuration, { isServer, dev }): Configuration => {
    if (!isServer) {
      config.cache = false;
      config.plugins.push(
        new ModuleFederationPlugin({
          name: 'nextapp',
          filename: 'static/chunks/remoteEntry.js',
          remotes,
          shared: {
            react: { 
              singleton: true, 
              requiredVersion: deps.react,
              eager: true,
              strictVersion: true
            },
            'react-dom': { 
              singleton: true, 
              requiredVersion: deps['react-dom'],
              eager: true,
              strictVersion: true
            },
            '@emotion/react': { singleton: true, eager: true },
            '@emotion/styled': { singleton: true, eager: true },
            '@mui/material': { singleton: true, eager: true },
            '@mui/icons-material': { singleton: true, eager: true }
          }
        })
      );
    }
    
    // Enable top level await
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    };

    return config;
  }
};
```

**Key Features**:
- Configures module federation for client-side
- Defines remote entry points
- Sets up shared dependencies
- Configures development and production paths

### 2. environments/config.ts
**Role**: Manages environment configuration and feature flags.

```typescript
import type { Environment, EnvironmentConfig } from '@/types/environment';

export function getCurrentEnvironment(): Environment {
  const env = process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV || 'local';
  return ['qa', 'staging', 'production'].includes(env) ? env as Environment : 'local';
}

export function getEnvironmentConfig(): EnvironmentConfig {
  return {
    NODE_ENV: process.env.NODE_ENV || 'development',
    APP_ENV: getCurrentEnvironment(),
    APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Passport Demo',
    APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
    APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    NAVIGATION_UI_URL: process.env.NEXT_PUBLIC_MICROUI_NAVIGATION_REMOTE_URL,
    CONTENT_UI_URL: process.env.NEXT_PUBLIC_MICROUI_CONTENT_REMOTE_URL,
    ENABLE_DEBUG_MODE: process.env.NEXT_PUBLIC_ENABLE_DEBUG_MODE === 'true',
  };
}
```

### 3. utils/RemoteModuleManager.ts
**Role**: Manages the loading and initialization of remote modules with environment awareness.

```typescript
export class RemoteModuleManager {
  private static instance: RemoteModuleManager;
  private readonly loadedContainers = new Set<string>();
  private readonly envConfig = getEnvironmentConfig();

  static getInstance(): RemoteModuleManager {
    if (!RemoteModuleManager.instance) {
      RemoteModuleManager.instance = new RemoteModuleManager();
    }
    return RemoteModuleManager.instance;
  }

  async loadRemoteModule(
    remoteUrl: string, 
    scope: string, 
    exposedModule: string
  ): Promise<React.ComponentType> {
    try {
      // Log environment info in debug mode
      if (this.envConfig.ENABLE_DEBUG_MODE) {
        console.log(`[MF] Loading remote module in ${this.envConfig.APP_ENV} environment`);
      }
      
      await this.ensureReactGlobal();
      // Module loading implementation
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      throw new Error(`[${this.envConfig.APP_ENV}] Failed to load ${exposedModule} from ${scope}: ${errorMessage}`);
    }
  }

  private async getSharedDependencies(): Promise<Record<string, unknown>> {
    // Enhanced shared dependencies with strict version control
    return {
      react: { 
        singleton: true,
        requiredVersion: deps.react,
        eager: true,
        strictVersion: true
      },
      // ... other shared dependencies
    };
  }
}
```

**Key Features**:
- Singleton pattern for module management
- Handles React version compatibility
- Manages script loading and initialization
- Provides error handling

### 4. components/RemoteComponent.tsx
**Role**: React component for loading and rendering remote modules with enhanced error handling and version tracking.

```typescript
const RemoteComponent: React.FC<Props> = (props) => {
  const loadRemoteComponent = async ({ scope, module, url }: Props) => {
    try {
      console.log(`[${scope}] Loading with React version:`, React.version);
      const moduleManager = RemoteModuleManager.getInstance();
      const Component = await moduleManager.loadRemoteModule(url, scope, module);
      return { default: Component };
    } catch (error) {
      console.error(`Failed to load remote component [${scope}/${module}]:`, error);
      throw error;
    }
  };

  const Component = dynamic(() => loadRemoteComponent(props), {
    loading: () => <div>Loading {props.scope}...</div>,
    ssr: false
  });

  return (
    <Suspense fallback={<div>Loading {props.scope}...</div>}>
      <Component />
    </Suspense>
  );
};
```

## Environment Configuration

### Environment Variables
The application now supports the following environment variables:
- `NEXT_PUBLIC_APP_ENV`: Current environment (local, qa, staging, production)
- `NEXT_PUBLIC_APP_NAME`: Application name
- `NEXT_PUBLIC_APP_VERSION`: Application version
- `NEXT_PUBLIC_APP_URL`: Base URL of the application
- `NEXT_PUBLIC_MICROUI_NAVIGATION_REMOTE_URL`: URL for navigation microfrontend
- `NEXT_PUBLIC_MICROUI_CONTENT_REMOTE_URL`: URL for content microfrontend
- `NEXT_PUBLIC_ENABLE_DEBUG_MODE`: Enable debug logging

### React Version Management
To prevent React hooks errors and version mismatches:
1. Strict version checking enabled in Module Federation
2. All shared dependencies configured as singletons
3. Debug logging for React versions in development
4. Proper error handling with environment context
5. Eager loading of shared dependencies

## Performance Optimizations
1. Cache disabled in client-side builds for consistency
2. Top-level await enabled for better async handling
3. Static optimization enabled with standalone output
4. Shared UI library dependencies to prevent duplication

## Security
CORS headers configured for proper microfrontend communication:
```typescript
async headers() {
  return [{
    source: '/:path*',
    headers: [
      { key: 'Access-Control-Allow-Origin', value: '*' },
      { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
      { key: 'Access-Control-Allow-Headers', value: 'X-Requested-With, Content-Type, Authorization' },
    ],
  }];
}

```typescript
'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { RemoteModuleManager } from '../utils/RemoteModuleManager';
import MicroFrontendErrorBoundary from './MicroFrontendErrorBoundary';

interface Props {
  config: MicroFrontendConfig;
}

const ModuleFederationContainer: React.FC<Props> = ({ config }) => {
  const Component = dynamic(
    () => loadRemoteComponent(config),
    {
      loading: () => <div>Loading {config.scope}...</div>,
      ssr: false
    }
  );

  return (
    <MicroFrontendErrorBoundary>
      <React.Suspense fallback={<div>Loading {config.scope}...</div>}>
        <Component />
      </React.Suspense>
    </MicroFrontendErrorBoundary>
  );
};
```

**Key Features**:
- Dynamic loading of remote components
- Error boundary implementation
- Loading state handling
- SSR configuration

### 4. components/MicroFrontendErrorBoundary.tsx
**Role**: Error handling for remote components.

```typescript
class MicroFrontendErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div>Error loading remote component</div>;
    }
    return this.props.children;
  }
}
```

**Key Features**:
- Catches runtime errors in remote components
- Provides fallback UI
- Prevents app crashes

### 5. config/micro-frontends.ts
**Role**: Configuration for remote modules.

```typescript
export interface MicroFrontendConfig {
  scope: string;
  module: string;
  url: string;
}

export const MICRO_FRONTENDS = {
  reactNav: {
    scope: 'reactnav',
    module: './App',
    url: 'http://localhost:3002/remoteEntry.js',
  },
  extractor: {
    scope: 'extracator',
    module: './App',
    url: 'http://localhost:3001/remoteEntry.js',
  },
} as const;
```

**Key Features**:
- Defines remote module configurations
- Type definitions for module config
- Environment-specific URLs

## Implementation Details

### Module Federation Setup
- Host name: 'nextapp'
- Remote entry filename: 'static/chunks/remoteEntry.js'
- React shared as singleton
- Strict version checking disabled

### Development Configuration
- Host runs on port 3000
- Supports hot module replacement
- Dynamic public path for development/production

### Remote Module Loading Process
1. RemoteModuleManager initializes
2. Script is loaded dynamically
3. Module federation container is initialized
4. React version compatibility is checked
5. Component is rendered with error boundary

## How to Use

### 1. Import and Use Remote Components
```typescript
import { ModuleFederationContainer } from './components/ModuleFederationContainer';
import { MICRO_FRONTENDS } from './config/micro-frontends';

// In your page or component:
export default function Page() {
  return (
    <ModuleFederationContainer 
      config={MICRO_FRONTENDS.extractor} 
    />
  );
}
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Build for Production
```bash
npm run build
```

## Dependencies
Key dependencies in package.json:
```json
{
  "dependencies": {
    "next": "15.4.7",
    "react": "^19.1.1",
    "react-dom": "^19.1.1"
  },
  "devDependencies": {
    "typescript": "^5",
    "webpack": "^5.101.3"
  }
}
```
