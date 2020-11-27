import { Authentication, User } from "./user";

declare module "@capacitor/core" {
  interface PluginRegistry {
    GoogleAuth: GoogleAuthPlugin;
  }
}

export interface GoogleAuthPlugin {
  signIn(): Promise<User>;
  refresh(): Promise<Authentication>;
  signOut(): Promise<any>;
}
