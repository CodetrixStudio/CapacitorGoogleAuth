# CapacitorGoogleAuth

Capacitor plugin for Google Auth.

## Contributions

PRs are welcome and much appreciated that keeps this plugin up to date with Capacitor and official Google Auth platform library feature parity.

Try to follow good code practices. You can even help keeping the included demo updated.

PRs for features that are not aligned with the official Google Auth library are discouraged.

(We are beginner-friendly here)

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

Register plugin and manually initialize

```ts
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

// use hook after platform dom ready
GoogleAuth.initialize({
  clientId: 'CLIENT_ID.apps.googleusercontent.com',
  scopes: ['profile', 'email'],
  grantOfflineAccess: true,
});
```

or if need use meta tags

```html
<meta name="google-signin-client_id" content="{your client id here}" />
<meta name="google-signin-scope" content="profile email" />
```

#### Options

- `clientId` - The app's client ID, found and created in the Google Developers Console.
- `scopes` – same as [Configure](#Configure) scopes
- `grantOfflineAccess` – boolean, default `false`, Set if your application needs to refresh access tokens when the user is not present at the browser.

Use it

```ts
GoogleAuth.signIn();
```

#### AngularFire2

init hook

```ts
// app.component.ts
constructor() {
  this.initializeApp();
}

initializeApp() {
  this.platform.ready().then(() => {
    GoogleAuth.initialize()
  })
}
```

sign in function

```ts
async googleSignIn() {
  let googleUser = await GoogleAuth.signIn();
  const credential = auth.GoogleAuthProvider.credential(googleUser.authentication.idToken);
  return this.afAuth.auth.signInAndRetrieveDataWithCredential(credential);
}
```

#### Vue 3

```ts
// App.vue
import { defineComponent, onMounted } from 'vue';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

export default defineComponent({
  setup() {
    onMounted(() => {
      GoogleAuth.initialize();
    });

    const logIn = async () => {
      const response = await GoogleAuth.signIn();
      console.log(response);
    };

    return {
      logIn,
    };
  },
});
```

or see more [CapacitorGoogleAuth-Vue3-example](https://github.com/reslear/CapacitorGoogleAuth-Vue3-example)

### iOS

1. Create in Google cloud console credential **Client ID for iOS** and get **Client ID** and **iOS URL scheme**

2. Add **identifier** `REVERSED_CLIENT_ID` as **URL schemes** to `Info.plist` from **iOS URL scheme**<br>
   (Xcode: App - Targets/App - Info - URL Types, click plus icon)

3. Set **Client ID** one of the ways:
   1. Set in `capacitor.config.json`
      - `iosClientId` - specific key for iOS
      - `clientId` - or common key for Android and iOS
   2. Download `GoogleService-Info.plist` file with `CLIENT_ID` and copy to **ios/App/App** necessarily through Xcode for indexing.

plugin first use `iosClientId` if not found use `clientId` if not found use value `CLIENT_ID` from file `GoogleService-Info.plist`

### Android

Set **Client ID** :

1. In `capacitor.config.json`

   - `androidClientId` - specific key for Android
   - `clientId` - or common key for Android and iOS

2. or set inside your `strings.xml`

plugin first use `androidClientId` if not found use `clientId` if not found use value `server_client_id` from file `strings.xml`

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

| Name                     | Type     | Description                                                                                                                   |
|--------------------------|----------|-------------------------------------------------------------------------------------------------------------------------------|
| clientId                 | string   | The app's client ID, found and created in the Google Developers Console.                                                      |
| iosClientId              | string   | Specific client ID key for iOS                                                                                                |
| androidClientId          | string   | Specific client ID key for Android                                                                                            |
| scopes                   | string[] | Scopes that you might need to request to access Google APIs<br>https://developers.google.com/identity/protocols/oauth2/scopes |
| serverClientId           | string   | This ClientId used for offline access and server side handling                                                                |
| forceCodeForRefreshToken | boolean  | Force user to select email address to regenerate AuthCode <br>used to get a valid refreshtoken (work on iOS and Android)      |


Provide configuration in root `capacitor.config.json`

```json
{
  "plugins": {
    "GoogleAuth": {
      "scopes": ["profile", "email"],
      "serverClientId": "xxxxxx-xxxxxxxxxxxxxxxxxx.apps.googleusercontent.com",
      "forceCodeForRefreshToken": true
    }
  }
}
```

or in `capacitor.config.ts`

```ts
/// <reference types="'@codetrix-studio/capacitor-google-auth'" />

const config: CapacitorConfig = {
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: 'xxxxxx-xxxxxxxxxxxxxxxxxx.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
  },
};

export default config;
```

## Migration guide

#### Migrate from 3.0.2 to 3.1.0

```diff
- GoogleAuth.init()
+ GoogleAuth.initialize()
```

#### Migrate from 2 to 3

After [migrate to Capcitor 3](https://capacitorjs.com/docs/updating/3-0) updating you projects, see diff:

##### WEB

```diff
- import "@codetrix-studio/capacitor-google-auth";
- import { Plugins } from '@capacitor/core';
+ import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth'

- Plugins.GoogleAuth.signIn();
+ GoogleAuth.init()
+ GoogleAuth.signIn()
```
