'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { RemoteModuleManager } from '../utils/RemoteModuleManager';

interface Props {
  scope: string;
  module: string;
  url: string;
}

const loadRemoteComponent = async ({ scope, module, url }: Props) => {
  try {
    console.log(`[${scope}] Loading with React version:`, React.version);
    
    const moduleManager = RemoteModuleManager.getInstance();
    const Component = await moduleManager.loadRemoteModule(url, scope, module);
    
    console.log(`[${scope}] Loaded with React version:`, React.version);
    console.log(`[${scope}] React instance:`, React);
    
    return { default: Component };
  } catch (error) {
    console.error(`Failed to load remote component [${scope}/${module}]:`, error);
    console.error('React version at error:', React.version);
    throw error;
  }
};

const RemoteComponent: React.FC<Props> = (props) => {
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

export default RemoteComponent;
