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
              <div className="max-w-[1200px] mx-auto mb-8">
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
