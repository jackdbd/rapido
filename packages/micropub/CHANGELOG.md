# @jackdbd/micropub

## 0.2.0-canary.12

### Minor Changes

- 2e51989: Add `location` to `jf2` microformat.
- ffc3401: Replace function `jf2ToWebsiteUrl` with `jf2ToLocation`, so it maps a jf2 object to a in the content store and on the website.

## 0.2.0-canary.11

### Minor Changes

- ea72c14: Several important changes:

  - Add schema and type for function `jf2ToWebsiteUrl`.
  - Give precedence to `content.text` over `content.html` when creating a slug with `jf2ToSlug`.
  - Add type guards to distinguish between MF2, MF2 JSON, JF2, urlencoded requests.
  - Define return types for functions: `deletePost`, `undeletePost`, `deleteMedia`, `uploadMedia`.
  - Add several tests.

- 48a0942: Handle MF2, parsed MF2 JSON, JF2, urlencoded request body in POST /micropub request handler.

## 0.2.0-canary.10

### Minor Changes

- 1d7b5bf: Move code from libs oauth2 and oauth2-tokens to lib indieauth.

### Patch Changes

- Updated dependencies [1d7b5bf]
  - @jackdbd/microformats2@0.2.0-canary.8

## 0.2.0-canary.9

### Minor Changes

- d2ff71d: Move schema definitions of all user-defined functions to indieauth and micropub packages.

### Patch Changes

- Updated dependencies [d2ff71d]
  - @jackdbd/microformats2@0.2.0-canary.7

## 0.2.0-canary.8

### Minor Changes

- 75690cc: Add schemas for user-provided functions in IndieAuth and Micropub.

## 0.2.0-canary.7

### Minor Changes

- 38ac06f: Use "vanilla" npm workspaces script (not Turborepo) when publishing packages.

### Patch Changes

- Updated dependencies [38ac06f]
  - @jackdbd/microformats2@0.2.0-canary.6

## 0.2.0-canary.6

### Minor Changes

- b2b0f1b: Build docs of all packages.

### Patch Changes

- Updated dependencies [b2b0f1b]
  - @jackdbd/microformats2@0.2.0-canary.5

## 0.2.0-canary.5

### Minor Changes

- d1bb983: Add `sideEffects: false` in package.json (for tree shaking)

### Patch Changes

- 6ca2d72: Lint all packages.
- Updated dependencies [d1bb983]
- Updated dependencies [6ca2d72]
  - @jackdbd/microformats2@0.2.0-canary.4

## 0.2.0-canary.4

### Patch Changes

- 75a494b: Update README.
- Updated dependencies [75a494b]
  - @jackdbd/microformats2@0.2.0-canary.3

## 0.2.0-canary.3

### Minor Changes

- caebe78: Bump packages.

### Patch Changes

- Updated dependencies [caebe78]
  - @jackdbd/microformats2@0.2.0-canary.2

## 0.2.0-canary.2

### Minor Changes

- Bump all packages.

### Patch Changes

- Updated dependencies
  - @jackdbd/microformats2@0.2.0-canary.1

## 0.2.0-canary.1

### Minor Changes

- 0f4349b: Add website predicates.

## 0.1.1-canary.0

### Patch Changes

- 82d22fb: Add packages.
