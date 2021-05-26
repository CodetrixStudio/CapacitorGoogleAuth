import { registerPlugin } from '@capacitor/core';
import { GoogleAuthWeb } from './web';
import type { GoogleAuthPlugin } from './definitions';

const GoogleAuth = registerPlugin<GoogleAuthPlugin>('GoogleAuth', {
  web: new GoogleAuthWeb(),
});

export * from './definitions';
export { GoogleAuth };
