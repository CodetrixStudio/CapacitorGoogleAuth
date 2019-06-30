import { WebPlugin } from '@capacitor/core';
import { GoogleAuthPlugin } from './definitions';
// @ts-ignore
import config from '../../../../../capacitor.config.json';

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

      if (config.plugins.GoogleAuth != null && config.plugins.GoogleAuth.scopes != null) {
        clientConfig.scope = config.plugins.GoogleAuth.scopes.join(' ');
      }

      gapi.auth2.init(clientConfig);
    });
  }

  async signIn(): Promise<any> {
    return new Promise(async (resolve) => {
      const user: any = {};
      const needsOfflineAccess = config.plugins.GoogleAuth.serverClientId != null;

      if (needsOfflineAccess) {
        const offlineAccessResponse = await gapi.auth2.getAuthInstance().grantOfflineAccess();
        user.serverAuthCode = offlineAccessResponse.code;
      } else {
        await gapi.auth2.getAuthInstance().signIn();
      }

      const googleUser = gapi.auth2.getAuthInstance().currentUser.get();

      if (needsOfflineAccess) {
        // HACK: AuthResponse is null if we don't do this when using grantOfflineAccess
        await googleUser.reloadAuthResponse();
      }

      const authResponse = googleUser.getAuthResponse(true);

      const profile = googleUser.getBasicProfile();
      user.email = profile.getEmail();
      user.familyName = profile.getFamilyName();
      user.givenName = profile.getGivenName();
      user.id = profile.getId();
      user.imageUrl = profile.getImageUrl();
      user.name = profile.getName();

      user.authentication = {
        accessToken: authResponse.access_token,
        idToken: authResponse.id_token
      }

      resolve(user);
    });
  }

  async signOut(): Promise<any> {
    return gapi.auth2.getAuthInstance().signOut();
  }
}

const GoogleAuth = new GoogleAuthWeb();

export { GoogleAuth };

import { registerWebPlugin } from '@capacitor/core';
registerWebPlugin(GoogleAuth);
