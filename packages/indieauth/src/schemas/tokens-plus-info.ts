import { Static, Type } from '@sinclair/typebox'
import { access_token } from './access-token.js'
import { client_id } from './client-application.js'
import { expires_in, redirect_uri, scope } from './common.js'
import { kid } from './jwk.js'
import { exp, jti } from './jwt.js'
import { me_after_url_canonicalization } from './me.js'
import { refresh_token } from './refresh-token.js'
import { issuer } from './server-metadata.js'

export const tokens_plus_info = Type.Object(
  {
    access_token,
    access_token_expires_in: expires_in,
    client_id,
    issuer,
    jti,
    kid,
    me: me_after_url_canonicalization,
    redirect_uri,
    refresh_token,
    refresh_token_expires_at: exp,
    scope
  },
  {
    $id: 'tokens-plus-info',
    additionalProperties: false,
    title: 'Tokens Plus Info',
    description:
      'Access token, refresh token, and some additional information about the issuer, the client, and the end-user.'
    // examples: [],
  }
)

// I think that `me` is always the end-user. Calling it resource owner doesn't seem correct.
// https://stackoverflow.com/questions/6269376/oauth-what-exactly-is-a-resource-owner-when-is-it-not-an-end-user

export type TokensPlusInfo = Static<typeof tokens_plus_info>
