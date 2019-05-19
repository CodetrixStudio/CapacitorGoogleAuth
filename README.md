# CapacitorGoogleAuth
Capacitor plugin for Google Auth.

### Install
```bash
npm i --save @codetrix-studio/capacitor-google-auth

npx cap update
```

### WEB
Add `clientId` meta tag to head.
```html
<meta name="google-signin-client_id" content="{your client id here}">
```

Register the plugin by importing it.
```ts
import "@codetrix-studio/capacitor-google-auth";
```

Use it
```ts
import { Plugins } from '@capacitor/core';
Plugins.GoogleAuth.signIn();
```



### AngularFire2
```ts
async googleSignIn() {
  let googleUser = await Plugins.GoogleAuth.signIn();
  const credential = auth.GoogleAuthProvider.credential(googleUser.authentication.idToken);
  return this.afAuth.auth.signInAndRetrieveDataWithCredential(credential);
}
```

### iOS
Make sure you have `GoogleService-Info.plist` with `CLIENT_ID`
Add `REVERSED_CLIENT_ID` as url scheme to `Info.plist`

### Support
✔️ iOS

✔️ Web

🔜 Android
