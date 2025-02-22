// TODO: do I actually need this library?
// import RefResolver from "json-schema-resolver";

// export const ref = RefResolver({
//   clone: true, // Clone the input schema without changing it. Default: false,
//   buildLocalReference(json, baseUri, fragment, i) {
//     // const filepath = path.join(SCHEMAS_ROOT, `${json.$id}.json`);
//     return `def-${i}`; // default value
//     // return filepath;
//     // return json.$id;
//   },
// });

export const ACCESS_TOKEN_EXPIRATION_IN_SECONDS = 10
export const ACCESS_TOKEN_EXPIRATION = `${ACCESS_TOKEN_EXPIRATION_IN_SECONDS} seconds`

export const CLIENT_ID_INDIEBOOKCLUB = 'https://indiebookclub.biz/id'
export const CLIENT_ID_NONEXISTENT = 'https://client-application.com/id'

export const CODE_CHALLENGE_METHOD = 'S256'
export const CODE_VERIFIER_LENGTH = 128

export const ISSUER = 'https://authorization-server.com/'

export const JWKS = process.env.JWKS
if (!JWKS) {
  throw new Error('JWKS environment variable is not set')
}

export const JWKS_PUBLIC_URL =
  'https://content.giacomodebidda.com/misc/jwks-pub.json'

// In some environments (e.g. Fly.io) we need to set JWKS as an escaped JSON
// string (e.g. "{\"keys\":[]}"). So in those environments we need to call
// JSON.parse twice to build the actual JS object.
let jwks = JSON.parse(JWKS)
if (typeof jwks === 'string') {
  jwks = JSON.parse(jwks)
}
export { jwks }

export const jwks_url = new URL(JWKS_PUBLIC_URL)

export const ME = 'https://end-user.com/me'

export const PROFILE_EMAIL = 'john.doe@email.com'
export const PROFILE_NAME = 'John Doe'
export const PROFILE_URL = 'https://john-doe.com/'
export const PROFILE_PHOTO = 'https://john-doe.com/photo.jpeg'

export const REDIRECT_URI_INDIEBOOKCLUB =
  'https://indiebookclub.biz/auth/callback'
export const REDIRECT_URI_NONEXISTENT =
  'https://client-application.com/auth/callback'

export const REFRESH_TOKEN_EXPIRATION_IN_SECONDS = 30
export const REFRESH_TOKEN_EXPIRATION = `${REFRESH_TOKEN_EXPIRATION_IN_SECONDS} seconds`

export const REQUIRED_CLAIMS = ['exp', 'iat', 'iss', 'jti']

export const SCOPE = 'create update profile email'
