import { Authentication, User } from './user';

export interface GoogleAuthPlugin {
  signIn(): Promise<User>;
  refresh(): Promise<Authentication>;
  signOut(): Promise<any>;

  /** Init hook for load gapi and init plugin */
  init(): void;
}
