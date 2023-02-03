import { WebPlugin } from '@capacitor/core';
import {Authentication, GoogleAuthPlugin, InitOptions, User} from './definitions';
import {decodeJwt} from 'jose'
import {JWTPayload} from "jose";

export class GoogleAuthWeb extends WebPlugin implements GoogleAuthPlugin {
  gapiLoaded: Promise<void>;
  options: InitOptions;

  constructor() {
    super();
  }

  loadScript() {
    if (typeof document === 'undefined') {
      return;
    }

    const scriptId = 'gapi';
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
      scopes: [], // Deprecated
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
      scopes: _options.scopes || [],
    };

    if (this.options.grantOfflineAccess) {
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
        google.accounts.id.initialize({
          client_id: this.options.clientId,
          callback: (response: google.accounts.id.CredentialResponse) => {
            const jwtPayload = decodeJwt(response.credential);
            const user = this.getUserFrom(jwtPayload);

            resolve(user);
          }
        });

        // Request for popup to open
        google.accounts.id.prompt((notification) => {
              if (notification.isNotDisplayed()) {
                reject({message: 'Not Displayed'});
              }
              if (notification.isSkippedMoment()) {
                reject({message: 'Skipped'});
              }

            }
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  async refresh(): Promise<Authentication> {
    // Doesn't look to be used with GIS
    return {
      accessToken: '',
      idToken: '',
      refreshToken: '',
    };
  }

  async signOut(): Promise<any> {
    // Doesn't look to be used with GIS
    return new Promise(null);
  }

  private getUserFrom(jwtPaylod: JWTPayload) {
    const user = {} as User;

    user.email = jwtPaylod.email as string;
    user.familyName = jwtPaylod.family_name as string;
    user.givenName = jwtPaylod.given_name as string;
    user.id =  jwtPaylod.sub as string;
    user.imageUrl = jwtPaylod.picture as string;
    user.imageUrl = jwtPaylod.name as string;

    // const authResponse = googleUser.getAuthResponse(true);
    user.authentication = {
      accessToken: '', // was authResponse.access_token
      idToken: '', // was authResponse.id_token
      refreshToken: '',
    };

    return user;
  }
}
