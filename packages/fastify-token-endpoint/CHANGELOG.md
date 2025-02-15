# @jackdbd/fastify-token-endpoint

## 1.3.0-canary.19

### Minor Changes

- cc4a499: Improve error responses. Add tests.

### Patch Changes

- Updated dependencies [0e82d17]
  - @jackdbd/indieauth@0.2.0-canary.12

## 1.3.0-canary.18

### Minor Changes

- 38a277f: Bump packages that depend on `@jackdbd/indieauth`.

### Patch Changes

- Updated dependencies [c56656a]
  - @jackdbd/indieauth@0.2.0-canary.11

## 1.3.0-canary.17

### Minor Changes

- 77d6437: Require `client_id` to be present in the request body of refresh requests (requests to refresh an access token). [OAuth 2.0 does not mention it](https://datatracker.ietf.org/doc/html/rfc6749#section-6), but [IndieAuth does require it](https://indieauth.spec.indieweb.org/#refreshing-an-access-token).

## 1.3.0-canary.16

### Minor Changes

- 0eac812: Handle request requests (grant type `refresh_token`).

## 1.3.0-canary.15

### Minor Changes

- 1d7b5bf: Move code from libs oauth2 and oauth2-tokens to lib indieauth.

### Patch Changes

- Updated dependencies [1d7b5bf]
  - @jackdbd/oauth2-error-responses@0.2.0-canary.8
  - @jackdbd/schema-validators@0.2.0-canary.11
  - @jackdbd/indieauth@0.2.0-canary.10

## 1.3.0-canary.14

### Minor Changes

- d2ff71d: Move schema definitions of all user-defined functions to indieauth and micropub packages.

### Patch Changes

- Updated dependencies [d2ff71d]
  - @jackdbd/oauth2-error-responses@0.2.0-canary.7
  - @jackdbd/schema-validators@0.2.0-canary.10
  - @jackdbd/oauth2-tokens@0.2.0-canary.11
  - @jackdbd/indieauth@0.2.0-canary.8
  - @jackdbd/oauth2@0.2.0-canary.6

## 1.3.0-canary.13

### Minor Changes

- 75690cc: Add schemas for user-provided functions in IndieAuth and Micropub.

### Patch Changes

- Updated dependencies [75690cc]
  - @jackdbd/indieauth@0.2.0-canary.7

## 1.3.0-canary.12

### Minor Changes

- 38ac06f: Use "vanilla" npm workspaces script (not Turborepo) when publishing packages.

### Patch Changes

- Updated dependencies [38ac06f]
  - @jackdbd/oauth2-error-responses@0.2.0-canary.6
  - @jackdbd/schema-validators@0.2.0-canary.9
  - @jackdbd/oauth2-tokens@0.2.0-canary.10
  - @jackdbd/indieauth@0.2.0-canary.6
  - @jackdbd/oauth2@0.2.0-canary.5

## 1.3.0-canary.11

### Minor Changes

- b2b0f1b: Build docs of all packages.

### Patch Changes

- Updated dependencies [b2b0f1b]
  - @jackdbd/oauth2-error-responses@0.2.0-canary.5
  - @jackdbd/schema-validators@0.2.0-canary.8
  - @jackdbd/oauth2-tokens@0.2.0-canary.9
  - @jackdbd/indieauth@0.2.0-canary.5
  - @jackdbd/oauth2@0.2.0-canary.4

## 1.3.0-canary.10

### Minor Changes

- 0fd14e4: Add script to vendorize internal packages like `@repo/error-handlers`.

## 1.3.0-canary.9

### Minor Changes

- d1bb983: Add `sideEffects: false` in package.json (for tree shaking)

### Patch Changes

- 6ca2d72: Lint all packages.
- Updated dependencies [d1bb983]
- Updated dependencies [6ca2d72]
  - @jackdbd/oauth2-error-responses@0.2.0-canary.4
  - @jackdbd/schema-validators@0.2.0-canary.7
  - @jackdbd/oauth2-tokens@0.2.0-canary.8
  - @jackdbd/indieauth@0.2.0-canary.4
  - @jackdbd/oauth2@0.2.0-canary.3

## 1.3.0-canary.8

### Minor Changes

- e9e5603: Declare `@fastify/request-context` as peer dependency in `@jackdbd/fastify-hooks`.

## 1.3.0-canary.7

### Minor Changes

- f18a27c: Bump plugin versions.

### Patch Changes

- 75a494b: Update README.
- Updated dependencies [75a494b]
  - @jackdbd/oauth2-error-responses@0.2.0-canary.3
  - @jackdbd/schema-validators@0.2.0-canary.6
  - @jackdbd/oauth2-tokens@0.2.0-canary.7
  - @jackdbd/indieauth@0.2.0-canary.3
  - @jackdbd/oauth2@0.2.0-canary.2

## 1.3.0-canary.6

### Minor Changes

- caebe78: Bump packages.

### Patch Changes

- Updated dependencies [caebe78]
  - @jackdbd/oauth2-error-responses@0.2.0-canary.2
  - @jackdbd/schema-validators@0.2.0-canary.5
  - @jackdbd/fastify-utils@0.2.0-canary.3
  - @jackdbd/oauth2-tokens@0.2.0-canary.6
  - @jackdbd/indieauth@0.2.0-canary.2
  - @jackdbd/oauth2@0.2.0-canary.1

## 1.3.0-canary.5

### Minor Changes

- Bump all packages.

### Patch Changes

- Updated dependencies
  - @jackdbd/oauth2-error-responses@0.2.0-canary.1
  - @jackdbd/schema-validators@0.2.0-canary.4
  - @jackdbd/fastify-utils@0.2.0-canary.2
  - @jackdbd/oauth2-tokens@0.2.0-canary.5
  - @jackdbd/indieauth@0.2.0-canary.1
  - @jackdbd/oauth2@0.2.0-canary.0

## 1.2.1-canary.4

### Patch Changes

- Updated dependencies [708218a]
  - @jackdbd/fastify-utils@0.2.0-canary.1

## 1.2.1-canary.3

### Patch Changes

- Updated dependencies [9c96bbf]
  - @jackdbd/fastify-utils@0.2.0-canary.0

## 1.2.1-canary.2

### Patch Changes

- @jackdbd/indieauth@0.1.1-canary.0
- @jackdbd/oauth2-tokens@0.1.1-canary.4

## 1.2.1-canary.1

### Patch Changes

- Updated dependencies [b2b3d62]
  - @jackdbd/oauth2-error-responses@0.1.1-canary.0

## 1.2.1-canary.0

### Patch Changes

- Updated dependencies
  - @jackdbd/schema-validators@0.1.1-canary.0
  - @jackdbd/oauth2-tokens@0.1.1-canary.0

## 1.2.0

### Minor Changes

- Bump minor version of all packages.

### Patch Changes

- Updated dependencies
  - @jackdbd/oauth2-error-responses@0.1.0
  - @jackdbd/schema-validators@0.1.0
  - @jackdbd/oauth2-tokens@0.1.0
  - @jackdbd/indieauth@0.1.0
  - @jackdbd/oauth2@0.1.0

## 1.1.8

### Patch Changes

- @jackdbd/indieauth@0.0.0
- @jackdbd/oauth2@0.0.0
- @jackdbd/oauth2-error-responses@0.0.0
- @jackdbd/oauth2-tokens@0.0.0
- @jackdbd/schema-validators@0.0.0

## 1.1.8-canary.1

### Patch Changes

- Patch bump all packages.
- Updated dependencies
  - @jackdbd/oauth2-error-responses@0.0.0-canary.1
  - @jackdbd/schema-validators@0.0.0-canary.1
  - @jackdbd/oauth2-tokens@0.0.0-canary.1
  - @jackdbd/indieauth@0.0.0-canary.1
  - @jackdbd/oauth2@0.0.0-canary.1

## 1.1.8-canary.0

### Patch Changes

- Bump packages after old CHANGELOGs have been removed.
- Updated dependencies
  - @jackdbd/oauth2-error-responses@0.0.0-canary.0
  - @jackdbd/schema-validators@0.0.0-canary.0
  - @jackdbd/oauth2-tokens@0.0.0-canary.0
  - @jackdbd/indieauth@0.0.0-canary.0
  - @jackdbd/oauth2@0.0.0-canary.0
