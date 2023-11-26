/// <reference types="@capacitor/cli" />

declare module '@capacitor/cli' {
  export interface PluginsConfig {
    GoogleAuth: GoogleAuthPluginOptions;
  }
}

export interface User {
  /**
   * The unique identifier for the user.
   */
  id: string;

  /**
   * The email address associated with the user.
   */
  email: string;

  /**
   * The user's full name on the Android platform.
   * @deprecated Use `name` instead. Will be removed in next major version.
   */
  displayName: string;

  /**
   * The user's full name.
   */
  name: string;

  /**
   * The family name (last name) of the user.
   */
  familyName: string;

  /**
   * The given name (first name) of the user.
   */
  givenName: string;

  /**
   * The URL of the user's profile picture.
   */
  imageUrl: string;

  /**
   * The server authentication code.
   */
  serverAuthCode: string;

  /**
   * The authentication details including access, refresh and ID tokens.
   */
  authentication: Authentication;
}

export interface Authentication {
  /**
   * The access token obtained during authentication.
   */
  accessToken: string;

  /**
   * The ID token obtained during authentication.
   */
  idToken: string;

  /**
   * The refresh token.
   * @warning This property is applicable only for mobile platforms (iOS and Android).
   */
  refreshToken?: string;
}

export interface GoogleAuthPluginOptions {
  /**
   * The default app's client ID, found and created in the Google Developers Console.
   * common for Android or iOS
   * @example xxxxxx-xxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
   * @since 3.1.0
   */
  clientId?: string;

  /**
   * Specific client ID key for iOS
   * @since 3.1.0
   */
  iosClientId?: string;

  /**
   * Specific client ID key for Android
   * @since 3.1.0
   */
  androidClientId?: string;

  /**
   * Specifies the default scopes required for accessing Google APIs.
   * @example ["profile", "email"]
   * @default ["email", "profile", "openid"]
   * @see [Google OAuth2 Scopes](https://developers.google.com/identity/protocols/oauth2/scopes)
   */
  scopes?: string[];

  /**
   * This is used for offline access and server side handling
   * @example xxxxxx-xxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
   * @default false
   */
  serverClientId?: string;

  /**
   * Force user to select email address to regenerate AuthCode used to get a valid refreshtoken (work on iOS and Android)
   * @default false
   */
  forceCodeForRefreshToken?: boolean;
}

export interface InitOptions {
  /**
   * The app's client ID, found and created in the Google Developers Console.
   * Common for Android or iOS.
   * The default is defined in the configuration.
   * @example xxxxxx-xxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
   * @since 3.1.0
   */
  clientId?: string;

  /**
   * Specifies the scopes required for accessing Google APIs
   * The default is defined in the configuration.
   * @example ["profile", "email"]
   * @see [Google OAuth2 Scopes](https://developers.google.com/identity/protocols/oauth2/scopes)
   */
  scopes?: string[];

  /**
   * Set if your application needs to refresh access tokens when the user is not present at the browser.
   * In response use `serverAuthCode` key
   *
   * @default false
   * @since 3.1.0
   * */
  grantOfflineAccess?: boolean;
}

export interface GoogleAuthPlugin {
  /**
   * Initializes the GoogleAuthPlugin, loading the gapi library and setting up the plugin.
   * @param options - Optional initialization options.
   * @since 3.1.0
   */
  initialize(options?: InitOptions): void;

  /**
   * Initiates the sign-in process and returns a Promise that resolves with the user information.
   */
  signIn(): Promise<User>;

  /**
   * Refreshes the authentication token and returns a Promise that resolves with the updated authentication details.
   */
  refresh(): Promise<Authentication>;

  /**
   * Signs out the user and returns a Promise.
   */
  signOut(): Promise<any>;
}
