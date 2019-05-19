import { WebPlugin } from '@capacitor/core';
import { GoogleAuthPlugin } from './definitions';

export class GoogleAuthWeb extends WebPlugin implements GoogleAuthPlugin {
  constructor() {
    super({
      name: 'GoogleAuth',
      platforms: ['web']
    });
  }

  async echo(options: { value: string }): Promise<{value: string}> {
    console.log('ECHO', options);
    return options;
  }
}

const GoogleAuth = new GoogleAuthWeb();

export { GoogleAuth };

import { registerWebPlugin } from '@capacitor/core';
registerWebPlugin(GoogleAuth);
