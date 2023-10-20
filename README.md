<h1 align="center">CapacitorGoogleAuth</h1>
<p align="center"><strong><code>@codetrix-studio/capacitor-google-auth</code></strong></p>
<p align="center"><strong>CAPACITOR 5</strong></p>
<p align="center">
Capacitor plugin for Google Auth.
</p>
<br>
<p align="center">
<a href="https://www.npmjs.com/package/@codetrix-studio/capacitor-google-auth"><img alt="npm" src="https://img.shields.io/npm/v/@codetrix-studio/capacitor-google-auth"></a> <a href="https://www.npmjs.com/package/@codetrix-studio/capacitor-google-auth"><img alt="npm" src="https://img.shields.io/npm/dt/@codetrix-studio/capacitor-google-auth"></a> <a href="https://www.npmjs.com/package/@codetrix-studio/capacitor-google-auth"><img alt="npm" src="https://img.shields.io/npm/dw/@codetrix-studio/capacitor-google-auth"></a> <a href="https://libraries.io/npm/@codetrix-studio%2Fcapacitor-google-auth"><img alt="Dependents (via libraries.io)" src="https://img.shields.io/librariesio/dependents/npm/@codetrix-studio/capacitor-google-auth"></a> <a href="https://packagephobia.com/result?p=@codetrix-studio/capacitor-google-auth"><img alt="install size" src="https://packagephobia.com/badge?p=@codetrix-studio/capacitor-google-auth"></a>
</p>

## Contributions

PRs are welcome and much appreciated that keeps this plugin up to date with Capacitor and official Google Auth platform library feature parity.

Try to follow good code practices. You can even help keeping the included demo updated.

PRs for features that are not aligned with the official Google Auth library are discouraged.

(We are beginner-friendly here)

## Install

#### 1. Install package

```sh
npm i --save @codetrix-studio/capacitor-google-auth
```

#### 2. Update capacitor deps

```sh
npx cap update
```

## Updating

If need migrate to different Capacitor versions [see instruction for migrate plugin to new version](#migration-guide).

## Usage

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

or if need use meta tags (Optional):

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

#### Angular

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

```vue
<script setup lang="ts">
import { defineComponent, onMounted } from 'vue';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

onMounted(() => {
  GoogleAuth.initialize();
});

async function logIn() {
  const response = await GoogleAuth.signIn();
  console.log(response);
}
</script>
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

**Refresh Method**
This method should be called when the app is initialized to establish if the user is currently logged in. If true, the method will return an accessToken, idToken and an empty refreshToken.
Example below:
```ts
checkLoggedIn() {
    GoogleAuth.refresh()
        .then((data) => {
            if (data.accessToken) {
                this.currentTokens = data;
            }
        })
        .catch((error) => {
            if (error.type === 'userLoggedOut') {
                this.signin()
            }
        });
}
```

## Configure

| Name                     | Type     | Description                                                                                                                   |
| ------------------------ | -------- | ----------------------------------------------------------------------------------------------------------------------------- |
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

#### Migrate from 3.2.x to 3.3.x

Install version 3.3.x:

```sh
npm i --save @codetrix-studio/capacitor-google-auth^3.3
```

Follow instruction for you project [Updating from Capacitor 4 to Capacitor 5](https://capacitorjs.com/docs/updating/5-0).

#### Migrate from 3.2.1 to 3.2.2

for `Android` in file `MainActivity.onCreate`

```diff
- this.init(savedInstanceState, new ArrayList<Class<? extends Plugin>>() {{
-   add(GoogleAuth.class);
- }});
+ this.registerPlugin(GoogleAuth.class);
```

#### Migrate from 3.1.x to 3.2.x

Install version 3.2.x:

```sh
npm i --save @codetrix-studio/capacitor-google-auth^3.2
```

Follow instruction for you project [Updating from Capacitor 3 to Capacitor 4](https://capacitorjs.com/docs/updating/4-0).

#### Migrate from 3.0.2 to 3.1.0

```diff
- GoogleAuth.init()
+ GoogleAuth.initialize()
```

#### Migrate from 2 to 3

Install version 3.x.x:

```sh
npm i --save @codetrix-studio/capacitor-google-auth^3.0
```

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

#### Migrate from 1 to 2

Install version 2.x.x:

```sh
npm i --save @codetrix-studio/capacitor-google-auth@2
```

for capacitor 2.x.x use [instruction](https://github.com/CodetrixStudio/CapacitorGoogleAuth/blob/79129ab37288f5f5d0bb9a568a95890e852cebc2/README.md)

## License

[MIT](./LICENSE)
