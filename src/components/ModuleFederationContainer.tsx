'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { MicroFrontendConfig } from '../config/micro-frontends';
import MicroFrontendErrorBoundary from './MicroFrontendErrorBoundary';
import { RemoteModuleManager } from '../utils/RemoteModuleManager';

// This ensures we're using the same React instance
const React_ = React;

interface Props {
  config: MicroFrontendConfig;
}

const loadRemoteComponent = async (config: MicroFrontendConfig) => {
  try {
    const moduleManager = RemoteModuleManager.getInstance();
    const Component = await moduleManager.loadRemoteModule(config.url, config.scope, config.module);
    
    // Wrap the component with React.memo for performance optimization
    return {
      default: React_.memo(Component)
    };
  } catch (error) {
    throw error;
  }
};

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

export default ModuleFederationContainer;
