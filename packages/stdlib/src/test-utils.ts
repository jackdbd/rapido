// import path from "node:path";
import Ajv from 'ajv'
import type { Options, Plugin, ValidateFunction } from 'ajv'
import addFormats from 'ajv-formats'
import c from 'ansi-colors'
// TODO: do I actually need this library?
// import RefResolver from "json-schema-resolver";
// import { SCHEMAS_ROOT } from "./constants.js";
import { EMOJI } from './emojis.js'

// export const ref = RefResolver({
//   clone: true, // Clone the input schema without changing it. Default: false,
//   buildLocalReference(json, baseUri, fragment, i) {
//     // const filepath = path.join(SCHEMAS_ROOT, `${json.$id}.json`);
//     return `def-${i}`; // default value
//     // return filepath;
//     // return json.$id;
//   },
// });

export const defAjv = (options?: Options) => {
  const opt = Object.assign({}, { allErrors: true }, options)
  // I have no idea why I have to do this to make TypeScript happy.
  // In JavaScript, Ajv and addFormats can be imported without any of this mess.
  const addFormatsPlugin = addFormats as any as Plugin<string[]>

  const ajv_with_formats = addFormatsPlugin(new Ajv.Ajv(opt), [
    'date',
    'date-time',
    'duration',
    'email',
    'hostname',
    'ipv4',
    'ipv6',
    'json-pointer',
    'regex',
    'relative-json-pointer',
    'time',
    'uri',
    'uri-reference',
    'uri-template',
    'uuid'
  ])

  return ajv_with_formats
}

export const check = (what: string, value: any, validate: ValidateFunction) => {
  const valid = validate(value)
  console.log(`is '${what}' valid?`, valid)

  // console.log('value after validation (and after defaults when Ajv useDefaults: true)')
  // console.log(value)

  if (validate.errors) {
    validate.errors.forEach((error, i) => {
      console.error(
        `${EMOJI.ERROR} validation error ${i + 1} in '${what}'`,
        error
      )
    })
  }
}

export const exitOne = (message: string) => {
  console.error(c.red(`${EMOJI.EXIT_ONE} ${message}`))
  process.exit(1)
}

export const exitZero = (message: string) => {
  console.log(c.green(`${EMOJI.EXIT_ZERO} ${message}`))
  process.exit(0)
}

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
