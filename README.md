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

Register plugin and manually initialize
```ts
import { GoogleAuth } from '@codetrix-studio/core';

GoogleAuth.init()
```

Use it
```ts
GoogleAuth.signIn()
```

#### AngularFire2
```ts
async googleSignIn() {
  let googleUser = await Plugins.GoogleAuth.signIn();
  const credential = auth.GoogleAuthProvider.credential(googleUser.authentication.idToken);
  return this.afAuth.auth.signInAndRetrieveDataWithCredential(credential);
}
```

#### Vue 3
```ts
// App.vue
import { defineComponent, onMounted } from 'vue'
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth'

export default defineComponent({
  setup() {
    onMounted(() => {
      GoogleAuth.init()
    })
    
    const logIn = async () => {
      const response = await GoogleAuth.signIn()
      console.log(response)
    }
    
    return {
      logIn
    }
  }
})
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

Import package inside your `MainActivity`
```java
import com.codetrixstudio.capacitor.GoogleAuth.GoogleAuth;
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
