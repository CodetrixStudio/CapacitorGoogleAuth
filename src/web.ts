import { WebPlugin } from '@capacitor/core';
import { Authentication, GoogleAuthPlugin, InitOptions, User, UserInfo } from './definitions';

/**
 * We use implicit flow as it doesn't require a backend platform (see https://developers.google.com/identity/oauth2/web/guides/choose-authorization-model#oauth_20_flow_comparison)
 */
export class GoogleAuthWeb extends WebPlugin implements GoogleAuthPlugin {
  gapiLoaded: Promise<void>;
  options: InitOptions;
  private accessToken: string;

  constructor() {
    super();
  }

  loadScript() {
    if (typeof document === 'undefined') {
      return;
    }

    const scriptId = 'gsi';
    const scriptEl = document?.getElementById(scriptId);

    if (scriptEl) {
      return;
    }

    const head = document.getElementsByTagName('head')[0];
    const script = document.createElement('script');

    script.type = 'text/javascript';
    script.defer = true;
    script.async = true;
    script.id = scriptId;
    script.src = 'https://accounts.google.com/gsi/client';
    head.appendChild(script);
  }

  initialize(
    _options: Partial<InitOptions> = {
      clientId: '',
      scopes: [],
      grantOfflineAccess: false, // Deprecated
    }
  ) {
    if (typeof window === 'undefined') {
      return;
    }

    const metaClientId = (document.getElementsByName('google-signin-client_id')[0] as any)?.content;
    const clientId = _options.clientId || metaClientId || '';

    if (!clientId) {
      console.warn('GoogleAuthPlugin - clientId is empty');
    }

    this.options = {
      clientId,
      grantOfflineAccess: _options.grantOfflineAccess ?? false,
      scopes: _options.scopes || ['profile', 'email', 'openid'],
    };

    if (this.options.grantOfflineAccess) {
      // @see https://developers.google.com/identity/oauth2/web/guides/migration-to-gis#library_quick_reference
      // Stating "Remove, follow the authorization code flow."
      console.warn('GoogleAuthPlugin - grantOfflineAccess true is deprecated');
    }

    this.gapiLoaded = new Promise((resolve) => {
      // HACK: Relying on window object, can't get property in gapi.load callback
      (window as any).gapiResolve = resolve;
      this.loadScript();
    });
  }

  async signIn(): Promise<User> {
    return new Promise<User>(async (resolve, reject) => {
      try {
        const tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: this.options.clientId,
          scope: this.options.scopes.join(' '),
          error_callback: () => {
            reject({ message: 'GoogleAuthPlugin - Popup skipped or not displayed' });
          },
          callback: (tokenResponse) => {
            this.accessToken = tokenResponse.access_token;
            const that = this;

            const xhr = new XMLHttpRequest();
            // See https://developers.google.com/identity/openid-connect/openid-connect#discovery for url
            xhr.open('GET', 'https://openidconnect.googleapis.com/v1/userinfo');
            xhr.setRequestHeader('Authorization', 'Bearer ' + this.accessToken);
            xhr.onreadystatechange = function () {
              if (this.readyState === XMLHttpRequest.DONE) {
                if (this.status === 200) {
                  const user = that.getUserFrom(JSON.parse(xhr.responseText));
                  user.authentication = {
                    accessToken: that.accessToken,
                    idToken: '', // not provided in implicit flow
                    refreshToken: '', // not provided in implicit flow
                  };
                  resolve(user);
                } else {
                  reject({ message: 'GoogleAuthPlugin - Wrong userinfo request' });
                }
              }
            };
            xhr.send();
          },
        });

        // Request for popup to open
        tokenClient.requestAccessToken();
      } catch (error) {
        reject(error);
      }
    });
  }

  refresh(): Promise<Authentication> {
    return new Promise<Authentication>(async (resolve, reject) => {
      try {
        const tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: this.options.clientId,
          scope: this.options.scopes.join(' '),
          callback: (tokenResponse) => {
            resolve({
              accessToken: tokenResponse.access_token,
              idToken: '', // not provided in implicit flow
              refreshToken: '', // not provided in implicit flow
            });
          },
          error_callback: () => {
            reject(null);
          },
        });
        // Request for popup to open
        tokenClient.requestAccessToken();
      } catch (error) {
        reject(error);
      }
    });
  }

  signOut(): Promise<any> {
    google.accounts.oauth2.revoke(this.accessToken, () => {});

    return new Promise(null);
  }

  getUserFrom(userJson: UserInfo): User {
    const user = {} as User;
    user.email = userJson.email;
    user.familyName = userJson.family_name;
    user.givenName = userJson.given_name;
    user.id = userJson.sub;
    user.imageUrl = userJson.picture;
    user.name = userJson.name;

    return user;
  }
}
