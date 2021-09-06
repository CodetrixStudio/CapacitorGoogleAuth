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

  /**
   * refreshToken only for iOS and Android
   */
  refreshToken?: string;
}

export interface GoogleAuthPluginOptions {
  /**
   * The app's client ID, found and created in the Google Developers Console.
   * common for Android or iOS
   * @example xxxxxx-xxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
   * @since 3.1.0
   */
  clientId: string;

  /**
   * Specific client ID key for iOS
   * @since 3.1.0
   */
  iosClientId: string;

  /**
   * Specific client ID key for Android
   * @since 3.1.0
   */
  androidClientId: string;

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

export interface InitOptions extends Pick<GoogleAuthPluginOptions, 'scopes' | 'clientId'> {
  /**
   * Set if your application needs to refresh access tokens when the user is not present at the browser.
   * In response use `serverAuthCode` key
   *
   * @default false
   * @since 3.1.0
   * */
  grantOfflineAccess: boolean;
}

export interface GoogleAuthPlugin {
  signIn(): Promise<User>;
  refresh(): Promise<Authentication>;
  signOut(): Promise<any>;

  /**
   * Init hook for load gapi and init plugin
   * @since 3.1.0
   * */
  initialize(options?: Partial<InitOptions>): void;
}
