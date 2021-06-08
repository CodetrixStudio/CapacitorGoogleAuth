# CapacitorGoogleAuth
Capacitor plugin for Google Auth.

## Install

#### 1. Install package
```bash
npm i --save @codetrix-studio/capacitor-google-auth

# or for Capacitor 2.x.x
npm i --save @codetrix-studio/capacitor-google-auth@2.1.3
```

#### 2. Update capacitor deps
```sh
npx cap update
```
#### 3. Migrate from 2 to 3 version
if your migrate from Capacitor 2 to Capacitor 3 [see instruction for migrate plugin to new version](#migrate-from-2-to-3)

## Usage
for capacitor 2.x.x use [instruction](https://github.com/CodetrixStudio/CapacitorGoogleAuth/blob/79129ab37288f5f5d0bb9a568a95890e852cebc2/README.md)

### WEB
Add [`clientId`](https://developers.google.com/identity/sign-in/web/sign-in#specify_your_apps_client_id) meta tag to head.
```html
<meta name="google-signin-client_id" content="{your client id here}">
```

Register plugin and manually initialize
```ts
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

// use hook after platform dom ready
GoogleAuth.init()
```


Use it
```ts
GoogleAuth.signIn()
```

#### AngularFire2

init hook
```ts
initializeApp() {
  this.platform.ready().then(() => {
    GoogleAuth.init();
  });
}
```

sign in function 
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

## Configure
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


### Migration guide

#### Migrate from 2 to 3

After [migrate to Capcitor 3](https://capacitorjs.com/docs/updating/3-0) updating you projects, see diff:

##### WEB
```diff
- import "@codetrix-studio/capacitor-google-auth";
- import { Plugins } from '@capacitor/core';
+ import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

- Plugins.GoogleAuth.signIn();
+ GoogleAuth.init()
+ GoogleAuth.signIn()
```
