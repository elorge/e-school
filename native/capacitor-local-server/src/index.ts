// native/capacitor-local-server/src/index.ts
import { registerPlugin } from '@capacitor/core';
import type { LocalServerPlugin } from './definitions';

const LocalServer = registerPlugin<LocalServerPlugin>('LocalServer', {
  web: () => import('./web').then((m) => new m.LocalServerWeb()),
});

export * from './definitions';
export { LocalServer };
