# [3.1.4](https://github.com/CodetrixStudio/CapacitorGoogleAuth/v3.1.3...v3.1.4) (2022-06-10)

### Fixes

- **Web**: discontinuing authorization support for the Google Sign-In JavaScript Platform Library [#208](https://github.com/CodetrixStudio/CapacitorGoogleAuth/pull/208) ([c9fca36](https://github.com/CodetrixStudio/CapacitorGoogleAuth/commit/c9fca36)), from [#202](https://github.com/CodetrixStudio/CapacitorGoogleAuth/issues/202)

# [3.1.3](https://github.com/CodetrixStudio/CapacitorGoogleAuth/v3.1.0...v3.1.3) (2022-04-03)

### Features

- iOS: ios return user when restorePreviousSignIn() (#194) ([8b69e12](https://github.com/CodetrixStudio/CapacitorGoogleAuth/commit/8b69e12)), fixes #69
- Android: added accessToken to Android implementation (#173) ([0ed544c](https://github.com/CodetrixStudio/CapacitorGoogleAuth/commit/0ed544c)), closes #53
- Android: separate messages for signin exception (#176) ([96626ba](https://github.com/CodetrixStudio/CapacitorGoogleAuth/commit/96626ba))

### Docs

- fix initialize parameter keys (#193) ([e7bd54c](https://github.com/CodetrixStudio/CapacitorGoogleAuth/commit/e7bd54c))

# [3.1.0](https://github.com/CodetrixStudio/CapacitorGoogleAuth/v3.0.2...v3.1.0) (2021-07-30)

### Features

- supporting .ts and.js config, exported types (#114) ([eaabf9d](https://github.com/CodetrixStudio/CapacitorGoogleAuth/commit/eaabf9d))
- update ios to GoogleSignIn 6.0.1 Pod (#136) ([4859f9c](https://github.com/CodetrixStudio/CapacitorGoogleAuth/commit/4859f9c))
- add prettier with ionic config (#137) ([6a7dba5](https://github.com/CodetrixStudio/CapacitorGoogleAuth/commit/6a7dba5))
- request additional scopes if necessary (#146) ([21f16fd](https://github.com/CodetrixStudio/CapacitorGoogleAuth/commit/21f16fd)) resolves #144

### BREAKING CHANGES

- use `GoogleAuth.initialize()` method instead of `GoogleAuth.init()`
