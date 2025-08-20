'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { MICRO_FRONTENDS } from '@/config/micro-frontends';

const RemoteComponent = dynamic(
  () => import('@/components/RemoteComponent'),
  { ssr: false }
);

export default function ExtractorPage() {
  return (
    <main className="flex min-h-screen flex-col p-4 gap-4">
      <div className="w-full">
        <Suspense fallback={<div>Loading navigation...</div>}>
          <RemoteComponent 
            scope={MICRO_FRONTENDS.reactNav.scope}
            module={MICRO_FRONTENDS.reactNav.module}
            url={MICRO_FRONTENDS.reactNav.url}
          />
        </Suspense>
      </div>
      <div className="w-full">
        <Suspense fallback={<div>Loading extractor...</div>}>
          <RemoteComponent 
            scope={MICRO_FRONTENDS.extractor.scope}
            module={MICRO_FRONTENDS.extractor.module}
            url={MICRO_FRONTENDS.extractor.url}
          />
        </Suspense>
      </div>
    </main>
  );
}
