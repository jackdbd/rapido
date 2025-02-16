# @jackdbd/fastify-media-endpoint

## 0.2.0-canary.18

### Patch Changes

- Updated dependencies [5be2e95]
  - @jackdbd/indieauth@0.2.0-canary.13
  - @jackdbd/fastify-hooks@0.2.0-canary.14

## 0.2.0-canary.17

### Patch Changes

- Updated dependencies [0e82d17]
  - @jackdbd/indieauth@0.2.0-canary.12
  - @jackdbd/fastify-hooks@0.2.0-canary.13

## 0.2.0-canary.16

### Minor Changes

- 38a277f: Bump packages that depend on `@jackdbd/indieauth`.

### Patch Changes

- Updated dependencies [38a277f]
- Updated dependencies [c56656a]
  - @jackdbd/fastify-hooks@0.2.0-canary.12
  - @jackdbd/indieauth@0.2.0-canary.11

## 0.2.0-canary.15

### Minor Changes

- 1d7b5bf: Move code from libs oauth2 and oauth2-tokens to lib indieauth.

### Patch Changes

- Updated dependencies [1d7b5bf]
  - @jackdbd/oauth2-error-responses@0.2.0-canary.8
  - @jackdbd/schema-validators@0.2.0-canary.11
  - @jackdbd/canonical-url@0.2.0-canary.8
  - @jackdbd/fastify-hooks@0.2.0-canary.11
  - @jackdbd/fastify-utils@0.2.0-canary.10
  - @jackdbd/indieauth@0.2.0-canary.10
  - @jackdbd/micropub@0.2.0-canary.10

## 0.2.0-canary.14

### Patch Changes

- Updated dependencies [ee97505]
  - @jackdbd/indieauth@0.2.0-canary.9

## 0.2.0-canary.13

### Minor Changes

- d2ff71d: Move schema definitions of all user-defined functions to indieauth and micropub packages.

### Patch Changes

- Updated dependencies [d2ff71d]
  - @jackdbd/oauth2-error-responses@0.2.0-canary.7
  - @jackdbd/schema-validators@0.2.0-canary.10
  - @jackdbd/canonical-url@0.2.0-canary.7
  - @jackdbd/fastify-hooks@0.2.0-canary.10
  - @jackdbd/fastify-utils@0.2.0-canary.9
  - @jackdbd/oauth2-tokens@0.2.0-canary.11
  - @jackdbd/indieauth@0.2.0-canary.8
  - @jackdbd/micropub@0.2.0-canary.9
  - @jackdbd/oauth2@0.2.0-canary.6

## 0.2.0-canary.12

### Minor Changes

- 75690cc: Add schemas for user-provided functions in IndieAuth and Micropub.

### Patch Changes

- Updated dependencies [75690cc]
  - @jackdbd/indieauth@0.2.0-canary.7
  - @jackdbd/micropub@0.2.0-canary.8

## 0.2.0-canary.11

### Minor Changes

- 38ac06f: Use "vanilla" npm workspaces script (not Turborepo) when publishing packages.

### Patch Changes

- Updated dependencies [38ac06f]
  - @jackdbd/oauth2-error-responses@0.2.0-canary.6
  - @jackdbd/schema-validators@0.2.0-canary.9
  - @jackdbd/canonical-url@0.2.0-canary.6
  - @jackdbd/fastify-hooks@0.2.0-canary.9
  - @jackdbd/fastify-utils@0.2.0-canary.8
  - @jackdbd/oauth2-tokens@0.2.0-canary.10
  - @jackdbd/indieauth@0.2.0-canary.6
  - @jackdbd/micropub@0.2.0-canary.7
  - @jackdbd/oauth2@0.2.0-canary.5

## 0.2.0-canary.10

### Minor Changes

- b2b0f1b: Build docs of all packages.

### Patch Changes

- Updated dependencies [b2b0f1b]
  - @jackdbd/oauth2-error-responses@0.2.0-canary.5
  - @jackdbd/schema-validators@0.2.0-canary.8
  - @jackdbd/canonical-url@0.2.0-canary.5
  - @jackdbd/fastify-hooks@0.2.0-canary.8
  - @jackdbd/fastify-utils@0.2.0-canary.7
  - @jackdbd/oauth2-tokens@0.2.0-canary.9
  - @jackdbd/indieauth@0.2.0-canary.5
  - @jackdbd/micropub@0.2.0-canary.6
  - @jackdbd/oauth2@0.2.0-canary.4

## 0.2.0-canary.9

### Minor Changes

- 0fd14e4: Add script to vendorize internal packages like `@repo/error-handlers`.

## 0.2.0-canary.8

### Minor Changes

- d1bb983: Add `sideEffects: false` in package.json (for tree shaking)

### Patch Changes

- 6ca2d72: Lint all packages.
- Updated dependencies [d1bb983]
- Updated dependencies [6ca2d72]
  - @jackdbd/oauth2-error-responses@0.2.0-canary.4
  - @jackdbd/schema-validators@0.2.0-canary.7
  - @jackdbd/canonical-url@0.2.0-canary.4
  - @jackdbd/fastify-hooks@0.2.0-canary.7
  - @jackdbd/fastify-utils@0.2.0-canary.6
  - @jackdbd/oauth2-tokens@0.2.0-canary.8
  - @jackdbd/indieauth@0.2.0-canary.4
  - @jackdbd/micropub@0.2.0-canary.5
  - @jackdbd/oauth2@0.2.0-canary.3

## 0.2.0-canary.7

### Minor Changes

- 4b4808e: Avoid registering @fastify/request-context.

## 0.2.0-canary.6

### Minor Changes

- e9e5603: Declare `@fastify/request-context` as peer dependency in `@jackdbd/fastify-hooks`.

### Patch Changes

- Updated dependencies [e9e5603]
  - @jackdbd/fastify-hooks@0.2.0-canary.6

## 0.2.0-canary.5

### Minor Changes

- f18a27c: Bump plugin versions.

### Patch Changes

- 75a494b: Update README.
- Updated dependencies [75a494b]
  - @jackdbd/oauth2-error-responses@0.2.0-canary.3
  - @jackdbd/schema-validators@0.2.0-canary.6
  - @jackdbd/canonical-url@0.2.0-canary.3
  - @jackdbd/fastify-hooks@0.2.0-canary.5
  - @jackdbd/fastify-utils@0.2.0-canary.5
  - @jackdbd/oauth2-tokens@0.2.0-canary.7
  - @jackdbd/indieauth@0.2.0-canary.3
  - @jackdbd/micropub@0.2.0-canary.4
  - @jackdbd/oauth2@0.2.0-canary.2

## 0.2.0-canary.4

### Minor Changes

- caebe78: Bump packages.

### Patch Changes

- Updated dependencies [caebe78]
  - @jackdbd/oauth2-error-responses@0.2.0-canary.2
  - @jackdbd/schema-validators@0.2.0-canary.5
  - @jackdbd/canonical-url@0.2.0-canary.2
  - @jackdbd/fastify-hooks@0.2.0-canary.3
  - @jackdbd/fastify-utils@0.2.0-canary.3
  - @jackdbd/oauth2-tokens@0.2.0-canary.6
  - @jackdbd/indieauth@0.2.0-canary.2
  - @jackdbd/micropub@0.2.0-canary.3
  - @jackdbd/oauth2@0.2.0-canary.1

## 0.2.0-canary.3

### Minor Changes

- Bump all packages.

### Patch Changes

- Updated dependencies
  - @jackdbd/oauth2-error-responses@0.2.0-canary.1
  - @jackdbd/schema-validators@0.2.0-canary.4
  - @jackdbd/canonical-url@0.2.0-canary.1
  - @jackdbd/fastify-hooks@0.2.0-canary.2
  - @jackdbd/fastify-utils@0.2.0-canary.2
  - @jackdbd/oauth2-tokens@0.2.0-canary.5
  - @jackdbd/indieauth@0.2.0-canary.1
  - @jackdbd/micropub@0.2.0-canary.2
  - @jackdbd/oauth2@0.2.0-canary.0

## 0.2.0-canary.2

### Minor Changes

- efb63e2: Use hooks from fastify-hooks (internal package).

## 0.1.1-canary.1

### Patch Changes

- Updated dependencies [708218a]
- Updated dependencies [708218a]
  - @jackdbd/fastify-utils@0.2.0-canary.1
  - @jackdbd/fastify-hooks@0.2.0-canary.0

## 0.1.1-canary.0

### Patch Changes

- Updated dependencies [9c96bbf]
  - @jackdbd/fastify-utils@0.2.0-canary.0
