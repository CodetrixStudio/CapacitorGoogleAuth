# CapacitorGoogleAuth
Capacitor plugin for Google Auth.

### Install
```bash
npm i --save @codetrix-studio/capacitor-google-auth

npx cap update
```

### WEB
Add [`clientId`](https://developers.google.com/identity/sign-in/web/sign-in#specify_your_apps_client_id) meta tag to head.
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

### Android
Inside your `strings.xml`
```xml
<resources>
  <string name="server_client_id">Your Web Client Key</string>
</resources>
```

Register plugin inside your `MainActivity.onCreate`
```java
this.init(savedInstanceState, new ArrayList<Class<? extends Plugin>>() {{
  add(GoogleAuth.class);
}});
```

### Configure
Provide configuration in root `capacitor.config.json`
```json
{
  "plugins": {
    "GoogleAuth": {
      "scopes": ["profile", "email"],
      "serverClientId": "xxxxxx-xxxxxxxxxxxxxxxxxx.apps.googleusercontent.com",
      "forceCodeForRefreshToken" : true
    }
  }
}

```

Note : `forceCodeForRefreshToken` force user to select email address to regenerate AuthCode used to get a valid refreshtoken (work on iOS and Android) (This is used for offline access and serverside handling)
