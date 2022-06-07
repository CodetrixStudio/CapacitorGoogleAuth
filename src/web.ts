import { WebPlugin } from '@capacitor/core';
import { GoogleAuthPlugin, InitOptions, User } from './definitions';

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
    script.onload = this.platformJsLoaded.bind(this);
    script.src = 'https://apis.google.com/js/platform.js';
    head.appendChild(script);
  }

  initialize(
    _options: Partial<InitOptions> = {
      clientId: '',
      scopes: [],
      grantOfflineAccess: false,
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
        client_id: this.options.clientId
      };

      // https://github.com/CodetrixStudio/CapacitorGoogleAuth/issues/202#issuecomment-1147393785
      clientConfig.plugin_name = 'ClarityCapacitorGoogleAuth';

      if (this.options.scopes.length) {
        clientConfig.scope = this.options.scopes.join(' ');
      }

      gapi.auth2.init(clientConfig);
      (window as any).gapiResolve();
    });
  }

  async signIn() {
    return new Promise<User>(async (resolve, reject) => {
      try {
        let serverAuthCode: string;
        const needsOfflineAccess = this.options.grantOfflineAccess ?? false;

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

  async refresh() {
    const authResponse = await gapi.auth2.getAuthInstance().currentUser.get().reloadAuthResponse();
    return {
      accessToken: authResponse.access_token,
      idToken: authResponse.id_token,
      refreshToken: '',
    };
  }

  async signOut() {
    return gapi.auth2.getAuthInstance().signOut();
  }

  private async addUserChangeListener() {
    await this.gapiLoaded;
    gapi.auth2.getAuthInstance().currentUser.listen((googleUser) => {
      this.notifyListeners('userChange', googleUser.isSignedIn() ? this.getUserFrom(googleUser) : null);
    });
  }

  private getUserFrom(googleUser: gapi.auth2.GoogleUser) {
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
      refreshToken: '',
    };

    return user;
  }
}
