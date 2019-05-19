declare module "@capacitor/core" {
  interface PluginRegistry {
    GoogleAuth: GoogleAuthPlugin;
  }
}

export interface GoogleAuthPlugin {
  echo(options: { value: string }): Promise<{value: string}>;
}
