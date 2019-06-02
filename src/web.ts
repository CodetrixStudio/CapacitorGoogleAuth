import { WebPlugin } from '@capacitor/core';
import { GoogleAuthPlugin } from './definitions';

export class GoogleAuthWeb extends WebPlugin implements GoogleAuthPlugin {
  constructor() {
    super({
      name: 'GoogleAuth',
      platforms: ['web']
    });

    this.initialize();
  }

  initialize() {
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.defer = true;
    script.async = true;
    script.onload = this.platformJsLoaded;
    script.src = 'https://apis.google.com/js/platform.js';
    head.appendChild(script);
  }

  platformJsLoaded() {
    gapi.load('auth2', async () => {
      const clientConfig: gapi.auth2.ClientConfig = {
        client_id: (document.getElementsByName('google-signin-client_id')[0] as any).content
      };
      gapi.auth2.init(clientConfig);
    });
  }

  async signIn(): Promise<any> {
    return new Promise(async (resolve) => {

      const googleUser = await gapi.auth2.getAuthInstance().signIn();

      const user = {
        authentication: {
          accessToken: googleUser.getAuthResponse().access_token,
          idToken: googleUser.getAuthResponse().id_token
        }
      }

      resolve(user);
    });
  }
}

const GoogleAuth = new GoogleAuthWeb();

export { GoogleAuth };

import { registerWebPlugin } from '@capacitor/core';
registerWebPlugin(GoogleAuth);
