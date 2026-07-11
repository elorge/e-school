// web/components/ServiceWorkerRegistration.tsx
'use client';

import { useEffect } from 'react';
import { registerServiceWorker } from '@/lib/register-service-worker';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    registerServiceWorker();
  }, []);
  return null;
}