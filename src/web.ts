import { WebPlugin } from '@capacitor/core';
import { GoogleAuthPlugin, GoogleAuthPluginOptionsWeb } from './definitions';
import { User, Authentication } from './user';

export class GoogleAuthWeb extends WebPlugin implements GoogleAuthPlugin {
  gapiLoaded: Promise<void>;
  options: GoogleAuthPluginOptionsWeb = {
    client_id: '',
    grantOfflineAccess: false,
    scopes: [],
  };

  get webConfigured(): boolean {
    if (typeof document !== 'undefined') {
      return document.getElementsByName('google-signin-client_id').length > 0;
    } else {
      return false;
    }
  }

  constructor() {
    super();
  }

  loadScript() {
    const scriptId = 'gapi';
    const scriptEl = document?.getElementById(scriptId);

    if (scriptEl) {
      return;
    }

    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');

    script.type = 'text/javascript';
    script.defer = true;
    script.async = true;
    script.id = scriptId;
    script.onload = this.platformJsLoaded;
    script.src = 'https://apis.google.com/js/platform.js';
    head.appendChild(script);
  }

  init(_options?: Partial<GoogleAuthPluginOptionsWeb>) {
    if (!this.webConfigured) {
      return;
    }

    if (_options) {
      this.options = { ..._options, ...this.options };
    }

    this.gapiLoaded = new Promise((resolve) => {
      // HACK: Relying on window object, can't get property in gapi.load callback
      (window as any).gapiResolve = resolve;
      this.loadScript();
    });

    this.addUserChangeListener();
  }

  platformJsLoaded() {
    gapi.load('auth2', () => {
      const clientConfig: gapi.auth2.ClientConfig = {
        client_id: (document.getElementsByName('google-signin-client_id')[0] as any).content,
      };

      if (this.options.scopes.length) {
        clientConfig.scope = this.options.scopes.join(' ');
      }

      gapi.auth2.init(clientConfig);
      (window as any).gapiResolve();
    });
  }

  async signIn(): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        var serverAuthCode: string;
        var needsOfflineAccess = this.options?.grantOfflineAccess ?? false;

        if (needsOfflineAccess) {
          const offlineAccessResponse = await gapi.auth2.getAuthInstance().grantOfflineAccess();
          serverAuthCode = offlineAccessResponse.code;
        } else {
          await gapi.auth2.getAuthInstance().signIn();
        }

        const googleUser = gapi.auth2.getAuthInstance().currentUser.get();

        if (needsOfflineAccess) {
          // HACK: AuthResponse is null if we don't do this when using grantOfflineAccess
          await googleUser.reloadAuthResponse();
        }

        const user = this.getUserFrom(googleUser);
        user.serverAuthCode = serverAuthCode;
        resolve(user);
      } catch (error) {
        reject(error);
      }
    });
  }

  async refresh(): Promise<Authentication> {
    const authResponse = await gapi.auth2.getAuthInstance().currentUser.get().reloadAuthResponse();
    return {
      accessToken: authResponse.access_token,
      idToken: authResponse.id_token,
    };
  }

  async signOut(): Promise<any> {
    return gapi.auth2.getAuthInstance().signOut();
  }

  private async addUserChangeListener() {
    await this.gapiLoaded;
    gapi.auth2.getAuthInstance().currentUser.listen((googleUser) => {
      this.notifyListeners('userChange', googleUser.isSignedIn() ? this.getUserFrom(googleUser) : null);
    });
  }

  private getUserFrom(googleUser: gapi.auth2.GoogleUser): User {
    const user = {} as User;
    const profile = googleUser.getBasicProfile();

    user.email = profile.getEmail();
    user.familyName = profile.getFamilyName();
    user.givenName = profile.getGivenName();
    user.id = profile.getId();
    user.imageUrl = profile.getImageUrl();
    user.name = profile.getName();

    const authResponse = googleUser.getAuthResponse(true);
    user.authentication = {
      accessToken: authResponse.access_token,
      idToken: authResponse.id_token,
    };

    return user;
  }
}
