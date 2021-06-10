
/// <reference types="@capacitor/cli" />
import { Authentication, User } from "./user";


declare module '@capacitor/cli' {
  export interface PluginsConfig extends GoogleAuthPluginOptions {}
}

export interface GoogleAuthPluginOptions {
  /**
   * Scopes that you might need to request to access Google APIs
   * @example ["profile", "email"]
   * @default []
   * @see @link https://developers.google.com/identity/protocols/oauth2/scopes
   */
  "scopes": string[],

  /**
   * This is used for offline access and serverside handling
   * @example xxxxxx-xxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
   */
  "serverClientId": string,

  /**
   * Force user to select email address to regenerate AuthCode used to get a valid refreshtoken (work on iOS and Android) 
   * @default false
   */
  "forceCodeForRefreshToken" : boolean
}

export interface GoogleAuthPluginOptionsWeb extends Pick<GoogleAuthPluginOptions, 'scopes'> {
  /** 
   * Set if your application needs to refresh access tokens when the user is not present at the browser.
   * In response use `serverAuthCode` key
   * 
   * @default false
   * */
   offline: boolean
}

export interface GoogleAuthPlugin {
  signIn(): Promise<User>;
  refresh(): Promise<Authentication>;
  signOut(): Promise<any>;

  /** Init hook for load gapi and init plugin */
  init(): void;
}
