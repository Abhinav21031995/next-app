'use client';

import React, { Suspense, useState } from 'react';
import dynamic from 'next/dynamic';
import { MICRO_FRONTENDS } from '@/config/micro-frontends';
import { LandingPage } from '@/components/Landing-Page/LandingPage';

const RemoteComponent = dynamic(
  () => import('@/components/RemoteComponent'),
  { ssr: false }
);

const ExtractorComponent = dynamic(
  () => import('@/components/RemoteComponent').then(mod => ({ 
    default: (props: any) => <mod.default {...props} /> 
  })),
  { ssr: false }
);

export default function Home() {
  const [showExtractor, setShowExtractor] = useState(false);

  React.useEffect(() => {


    // Listen for navigation events from the navbar
    const handleNavigation = (event: CustomEvent) => {
      if (event.detail?.path === '/extractor') {
        setShowExtractor(true);
      }
    };
    window.addEventListener('navigate', handleNavigation as any);
    return () => window.removeEventListener('navigate', handleNavigation as any);
  }, []);

  return (
    <main className="flex min-h-screen flex-col">
      <div className="w-full">
        <Suspense fallback={<div>Loading navigation...</div>}>
          <RemoteComponent 
            scope={MICRO_FRONTENDS.reactNav.scope}
            module={MICRO_FRONTENDS.reactNav.module}
            url={MICRO_FRONTENDS.reactNav.url}
          />
        </Suspense>
      </div>
      
      <div className="flex-1">
        {showExtractor ? (
          <Suspense fallback={<div>Loading extractor...</div>}>
            <ExtractorComponent 
              scope={MICRO_FRONTENDS.extractor.scope}
              module={MICRO_FRONTENDS.extractor.module}
              url={MICRO_FRONTENDS.extractor.url}
            />
          </Suspense>
        ) : (
          <LandingPage />
        )}
      </div>
    </main>
  );
}
