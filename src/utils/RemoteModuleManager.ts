import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { getEnvironmentConfig, isDevelopment } from '@/environments/config';

interface ModuleFederationContainer {
  init: (shared: Record<string, unknown>) => Promise<void>;
  get: (module: string) => Promise<() => { default: React.ComponentType }>;
}

declare global {
  interface Window {
    [key: string]: ModuleFederationContainer | unknown;
    React?: typeof React;
    ReactDOM?: typeof ReactDOM;
    __webpack_require__?: {
      cache?: Record<number, { exports: unknown; loaded: boolean; id: number }>;
    };
  }
}

export class RemoteModuleManager {
  private static instance: RemoteModuleManager;
  private readonly loadedContainers = new Set<string>();
  private readonly containerPromises = new Map<string, Promise<void>>();
  private readonly envConfig = getEnvironmentConfig();

  static getInstance(): RemoteModuleManager {
    if (!RemoteModuleManager.instance) {
      RemoteModuleManager.instance = new RemoteModuleManager();
    }
    return RemoteModuleManager.instance;
  }

  async loadRemoteModule(remoteUrl: string, moduleName: string, exposedModule: string): Promise<React.ComponentType> {
    try {
      // STEP 1: Expose React/ReactDOM globally
      await this.ensureReactGlobal();

      // Log environment info in debug mode
      if (this.envConfig.ENABLE_DEBUG_MODE) {
        console.log(`[MF] Loading remote module in ${this.envConfig.APP_ENV} environment`);
        console.log(`[MF] Remote URL: ${remoteUrl}`);
        console.log(`[MF] App Version: ${this.envConfig.APP_VERSION}`);
      }

      // STEP 2: Load remote script
      if (!this.loadedContainers.has(moduleName)) {
        if (!this.containerPromises.has(moduleName)) {
          this.containerPromises.set(moduleName, this.loadScript(remoteUrl, moduleName));
        }
        await this.containerPromises.get(moduleName);
      }

      // STEP 3: Resolve container
      const container = window[moduleName] as ModuleFederationContainer;
      if (!container) {
        throw new Error(`Container '${moduleName}' not found on window after loading script`);
      }

      // STEP 4: Init container with shared deps
      if (!this.loadedContainers.has(moduleName)) {
        try {
          const sharedDeps = await this.getSharedDependencies();
          await container.init(sharedDeps);
          this.loadedContainers.add(moduleName);
          if (isDevelopment()) {
            console.log(`[MF] ${moduleName} initialized with shared React ${React.version}`);
          }
        } catch (error) {
          if (error instanceof Error && error.message.includes('already been initialized')) {
            this.loadedContainers.add(moduleName);
            console.warn(`[MF] ${moduleName} already initialized`);
          } else {
            throw new Error(`Failed to initialize ${moduleName}: ${error}`);
          }
        }
      }

      // STEP 5: Load remote module
      const factory = await container.get(exposedModule);
      const Module = factory();

      if (!Module?.default) {
        throw new Error(`Module '${exposedModule}' in ${moduleName} is missing default export.`);
      }

      return Module.default;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      throw new Error(`[${this.envConfig.APP_ENV}] Failed to load ${exposedModule} from ${moduleName}: ${errorMessage}`);
    }
  }

  private loadScript(url: string, moduleName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const existingScript = document.querySelector(`script[src="${url}"]`);
      if (existingScript && window[moduleName]) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = url;
      script.type = 'text/javascript';
      script.async = true;
      script.crossOrigin = 'anonymous';

      script.onload = () => {
        if (window[moduleName]) {
          if (isDevelopment()) {
            console.log(`[MF] ${moduleName} script loaded from ${url}`);
          }
          resolve();
        } else {
          reject(new Error(`[MF] ${moduleName} not found after loading script`));
        }
      };

      script.onerror = () => reject(new Error(`[MF] Failed to load script from ${url}`));

      document.head.appendChild(script);
    });
  }

  private async ensureReactGlobal(): Promise<void> {
    if (typeof window !== 'undefined') {
      // Import React dynamically to avoid Next.js bundling conflicts
      const [ReactLib, ReactDOMLib] = await Promise.all([
        import('react'),
        import('react-dom')
      ]);

      // Ensure we're using the same React instance globally
      window.React = ReactLib.default || ReactLib;
      window.ReactDOM = ReactDOMLib.default || ReactDOMLib;
      
      if (this.envConfig.ENABLE_DEBUG_MODE) {
        console.log(`[MF] Global React version: ${window.React.version}`);
      }
    }
  }

  private async getSharedDependencies(): Promise<Record<string, unknown>> {
    // Ensure React is available globally first
    await this.ensureReactGlobal();
    
    const ReactLib = window.React;
    const ReactDOMLib = window.ReactDOM;

    if (!ReactLib || !ReactDOMLib) {
      throw new Error('React or ReactDOM not available globally');
    }

    // Get actual React version dynamically
    const reactVersion = ReactLib.version || '19.1.0';
    if (this.envConfig.ENABLE_DEBUG_MODE) {
      console.log(`[MF] Sharing React version: ${reactVersion}`);
    }

    // Create shared module factory that returns the global React instance
    const createReactFactory = () => Promise.resolve(() => ReactLib);
    const createReactDOMFactory = () => Promise.resolve(() => ReactDOMLib);

    // Support multiple versions including canary builds
    const versionEntries = {
      get: createReactFactory,
      loaded: true,
      eager: true,
    };

    const domVersionEntries = {
      get: createReactDOMFactory,
      loaded: true,
      eager: true,
    };

    return {
      react: {
        [reactVersion]: versionEntries,
        // Support specific versions
        '19.1.0': versionEntries,
        '19.1.1': versionEntries,
        // Support for ^18.2.0 which remote apps require
        '^18.2.0': versionEntries,
        // Fallback for any 18.x or 19.x version
        '^18.0.0': versionEntries,
        '^19.0.0': versionEntries
      },
      'react-dom': {
        [reactVersion]: domVersionEntries,
        // Support specific versions
        '19.1.0': domVersionEntries,
        '19.1.1': domVersionEntries,
        // Support for ^18.2.0 which remote apps require
        '^18.2.0': domVersionEntries,
        // Fallback for any 18.x or 19.x version
        '^18.0.0': domVersionEntries,
        '^19.0.0': domVersionEntries
      },
    };
  }
}
