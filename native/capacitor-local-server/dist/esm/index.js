import { registerPlugin } from '@capacitor/core';
const LocalServer = registerPlugin('LocalServer', {
    web: () => import('./web').then((m) => new m.LocalServerWeb()),
});
export * from './definitions';
export { LocalServer };
