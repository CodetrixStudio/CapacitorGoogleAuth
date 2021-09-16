# [3.1.0](https://github.com/CodetrixStudio/CapacitorGoogleAuth/v3.0.2...v3.1.0) (2021-07-30)

### Features

- supporting .ts and.js config, exported types ([4859f9c](https://github.com/CodetrixStudio/CapacitorGoogleAuth/commit/)) closes [#114](https://github.com/CodetrixStudio/CapacitorGoogleAuth/pull/114)
- update ios to GoogleSignIn 6.0.1 Pod ([4859f9c](https://github.com/CodetrixStudio/CapacitorGoogleAuth/commit/4859f9c11b53476c9247f4697bae5b8b33022870)) closes [#136](https://github.com/CodetrixStudio/CapacitorGoogleAuth/pull/136)
- add prettier with ionic config ([6a7dba5](https://github.com/CodetrixStudio/CapacitorGoogleAuth/commit/6a7dba58e6a98d9b2b13aa19ff78e11e3b062070)) closes [#137](https://github.com/CodetrixStudio/CapacitorGoogleAuth/pull/137)
- request additional scopes if necessary ([21f16fd](https://github.com/CodetrixStudio/CapacitorGoogleAuth/commit/21f16fdebf778e3b0f166edf7a16d994fb57a56c)) resolves  [#144](https://github.com/CodetrixStudio/CapacitorGoogleAuth/issues/144)

### BREAKING CHANGES

- use `GoogleAuth.initialize()` method instead of `GoogleAuth.init()`
