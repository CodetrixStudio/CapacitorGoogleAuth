declare module "@capacitor/core" {
  interface PluginRegistry {
    GoogleAuth: GoogleAuthPlugin;
  }
}

export interface GoogleAuthPlugin {
  signIn(options: { value: string }): Promise<{value: string}>;
}
