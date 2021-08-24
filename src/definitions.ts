/// <reference types="@capacitor/cli" />

declare module '@capacitor/cli' {
  export interface PluginsConfig {
    GoogleAuth: GoogleAuthPluginOptions;
  }
}

export interface User {
  id: string;
  email: string;

  name: string;
  familyName: string;
  givenName: string;
  imageUrl: string;

  serverAuthCode: string;
  authentication: Authentication;
}

export interface Authentication {
  accessToken: string;
  idToken: string;
}

export interface GoogleAuthPluginOptions {
  /**
   * Scopes that you might need to request to access Google APIs
   * @example ["profile", "email"]
   * @default []
   * @see @link https://developers.google.com/identity/protocols/oauth2/scopes
   */
  scopes: string[];

  /**
   * This is used for offline access and server side handling
   * @example xxxxxx-xxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
   */
  serverClientId: string;

  /**
   * Force user to select email address to regenerate AuthCode used to get a valid refreshtoken (work on iOS and Android)
   * @default false
   */
  forceCodeForRefreshToken: boolean;
}

export interface InitOptions extends Pick<GoogleAuthPluginOptions, 'scopes'> {
  /** The app's client ID, found and created in the Google Developers Console.
   * @since 3.0.2
   */
  clientId: string;

  /**
   * Set if your application needs to refresh access tokens when the user is not present at the browser.
   * In response use `serverAuthCode` key
   *
   * @default false
   * @since 3.0.2
   * */
  grantOfflineAccess: boolean;
}

export interface GoogleAuthPlugin {
  signIn(): Promise<User>;
  refresh(): Promise<Authentication>;
  signOut(): Promise<any>;

  /** Init hook for load gapi and init plugin */
  init(options?: Partial<InitOptions>): void;
}
