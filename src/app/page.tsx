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
    // Check URL on mount
    const path = window.location.pathname;
    if (path === '/extractor') {
      setShowExtractor(true);
    }

    // Listen for navigation events from the navbar
    const handleNavigation = (event: CustomEvent) => {
      if (event.detail?.path === '/extractor') {
        setShowExtractor(true);
      } else if (event.detail?.path === '/') {
        setShowExtractor(false);
      }
    };

    // Listen for URL changes
    const handleUrlChange = () => {
      const path = window.location.pathname;
      setShowExtractor(path === '/extractor');
    };

    window.addEventListener('navigate', handleNavigation as any);
    window.addEventListener('popstate', handleUrlChange);
    
    return () => {
      window.removeEventListener('navigate', handleNavigation as any);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  return (
    <main className="flex min-h-screen flex-col overflow-hidden">
      <div className="w-full h-[10vh] min-h-[64px] max-h-[80px] relative z-10">
        <Suspense fallback={<div>Loading navigation...</div>}>
          <RemoteComponent 
            scope={MICRO_FRONTENDS.reactNav.scope}
            module={MICRO_FRONTENDS.reactNav.module}
            url={MICRO_FRONTENDS.reactNav.url}
          />
        </Suspense>
      </div>
      
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-auto px-4 py-2 mb-4">
          {showExtractor ? (
            <Suspense fallback={<div>Loading extractor...</div>}>
              <div className="max-w-[1200px] mx-auto mb-8" data-extractor-page="true">
                <ExtractorComponent 
                  scope={MICRO_FRONTENDS.extractor.scope}
                  module={MICRO_FRONTENDS.extractor.module}
                  url={MICRO_FRONTENDS.extractor.url}
                />
              </div>
            </Suspense>
          ) : (
            <LandingPage />
          )}
        </div>
        <div className="h-[5vh] bg-gray-100"></div>
      </div>
    </main>
  );
}
