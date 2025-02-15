# @jackdbd/indieauth

## 0.2.0-canary.12

### Minor Changes

- 0e82d17: Improve `error_description` in `errorResponseFromJSONResponse` when URL is not found (404).

## 0.2.0-canary.11

### Minor Changes

- c56656a: The `clientMetadata` function can now retrieve [IndieAuth client metadata](https://indieauth.spec.indieweb.org/#client-metadata-p-2) from HTML (in addition to JSON). For example, [Quill](https://quill.p3k.io/) is one app that embeds its client metadata in its HTML.

## 0.2.0-canary.10

### Minor Changes

- 1d7b5bf: Move code from libs oauth2 and oauth2-tokens to lib indieauth.

### Patch Changes

- Updated dependencies [1d7b5bf]
  - @jackdbd/schema-validators@0.2.0-canary.11
  - @jackdbd/canonical-url@0.2.0-canary.8
  - @jackdbd/pkce@0.2.0-canary.7

## 0.2.0-canary.9

### Minor Changes

- ee97505: Add schemas for IndieAuth client application records.

## 0.2.0-canary.8

### Minor Changes

- d2ff71d: Move schema definitions of all user-defined functions to indieauth and micropub packages.

### Patch Changes

- Updated dependencies [d2ff71d]
  - @jackdbd/canonical-url@0.2.0-canary.7
  - @jackdbd/oauth2-tokens@0.2.0-canary.11
  - @jackdbd/oauth2@0.2.0-canary.6
  - @jackdbd/pkce@0.2.0-canary.6

## 0.2.0-canary.7

### Minor Changes

- 75690cc: Add schemas for user-provided functions in IndieAuth and Micropub.

## 0.2.0-canary.6

### Minor Changes

- 38ac06f: Use "vanilla" npm workspaces script (not Turborepo) when publishing packages.

### Patch Changes

- Updated dependencies [38ac06f]
  - @jackdbd/canonical-url@0.2.0-canary.6
  - @jackdbd/oauth2@0.2.0-canary.5
  - @jackdbd/pkce@0.2.0-canary.5

## 0.2.0-canary.5

### Minor Changes

- b2b0f1b: Build docs of all packages.

### Patch Changes

- Updated dependencies [b2b0f1b]
  - @jackdbd/canonical-url@0.2.0-canary.5
  - @jackdbd/oauth2@0.2.0-canary.4
  - @jackdbd/pkce@0.2.0-canary.4

## 0.2.0-canary.4

### Minor Changes

- d1bb983: Add `sideEffects: false` in package.json (for tree shaking)

### Patch Changes

- 6ca2d72: Lint all packages.
- Updated dependencies [d1bb983]
- Updated dependencies [6ca2d72]
  - @jackdbd/canonical-url@0.2.0-canary.4
  - @jackdbd/oauth2@0.2.0-canary.3
  - @jackdbd/pkce@0.2.0-canary.3

## 0.2.0-canary.3

### Patch Changes

- 75a494b: Update README.
- Updated dependencies [75a494b]
  - @jackdbd/canonical-url@0.2.0-canary.3
  - @jackdbd/oauth2@0.2.0-canary.2
  - @jackdbd/pkce@0.2.0-canary.2

## 0.2.0-canary.2

### Minor Changes

- caebe78: Bump packages.

### Patch Changes

- Updated dependencies [caebe78]
  - @jackdbd/canonical-url@0.2.0-canary.2
  - @jackdbd/oauth2@0.2.0-canary.1
  - @jackdbd/pkce@0.2.0-canary.1

## 0.2.0-canary.1

### Minor Changes

- Bump all packages.

### Patch Changes

- Updated dependencies
  - @jackdbd/canonical-url@0.2.0-canary.1
  - @jackdbd/oauth2@0.2.0-canary.0
  - @jackdbd/pkce@0.2.0-canary.0

## 0.1.1-canary.0

### Patch Changes

- Updated dependencies [4869d65]
  - @jackdbd/canonical-url@0.1.1-canary.0

## 0.1.0

### Minor Changes

- Bump minor version of all packages.

### Patch Changes

- Updated dependencies
  - @jackdbd/canonical-url@0.1.0
  - @jackdbd/oauth2@0.1.0
  - @jackdbd/pkce@0.1.0

## 0.0.0

### Patch Changes

- @jackdbd/canonical-url@0.0.0
- @jackdbd/oauth2@0.0.0
- @jackdbd/pkce@0.0.0

## 0.0.0-canary.1

### Patch Changes

- Patch bump all packages.
- Updated dependencies
  - @jackdbd/canonical-url@0.0.0-canary.1
  - @jackdbd/oauth2@0.0.0-canary.1
  - @jackdbd/pkce@0.0.0-canary.1

## 0.0.0-canary.0

### Patch Changes

- Bump packages after old CHANGELOGs have been removed.
- Updated dependencies
  - @jackdbd/canonical-url@0.0.0-canary.0
  - @jackdbd/oauth2@0.0.0-canary.0
  - @jackdbd/pkce@0.0.0-canary.0
