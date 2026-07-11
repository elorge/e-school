// web/lib/school-context.tsx
'use client';

import { createContext, useContext } from 'react';
import type { School } from './types';

const SchoolContext = createContext<School | null>(null);

export function SchoolProvider({ school, children }: { school: School; children: React.ReactNode }) {
  return <SchoolContext.Provider value={school}>{children}</SchoolContext.Provider>;
}

export function useSchool(): School {
  const school = useContext(SchoolContext);
  if (!school) {
    throw new Error('useSchool() must be used within a SchoolProvider — check this renders under app/[school]/layout.tsx');
  }
  return school;
}