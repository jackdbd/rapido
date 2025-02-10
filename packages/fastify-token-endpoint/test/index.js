import { describe, it } from 'node:test'
import Fastify from 'fastify'
import { nanoid } from 'nanoid'
import { codeVerifier } from '@jackdbd/pkce'
import {
  CLIENT_ID_NONEXISTENT,
  ISSUER,
  jwks,
  REDIRECT_URI_NONEXISTENT
} from '@repo/stdlib/test-utils'
import tokenEndpoint from '../lib/index.js'

const AUTHORIZATION_ENDPOINT = 'http://localhost:3000/auth'
const REVOCATION_ENDPOINT = 'http://localhost:3000/revoke'
const USERINFO_ENDPOINT = 'http://localhost:3000/userinfo'

const code_valid = nanoid(32)
const code_verifier_valid = codeVerifier({ len: 43, seed: 123 })

const isAccessTokenRevoked = async (_jti) => {
  // console.log(`verify whether access token jti=${jti} is revoked or not`);
  return false
}

const onIssuedTokens = async (_props) => {
  // console.log(`persist records about access/refresh token`, props);
}

const retrieveRefreshToken = async (_token_id) => {
  // console.log(`retrieve record about this refresh token: ${token_id}`);
  const record = {} // client_id, redirect_uri, scope, etc...
  return record
}

describe('token-endpoint plugin', () => {
  describe('registration', () => {
    it('adds a POST /token route', async (t) => {
      const fastify = Fastify()

      await fastify.register(tokenEndpoint, {
        includeErrorDescription: true,
        isAccessTokenRevoked,
        authorizationEndpoint: AUTHORIZATION_ENDPOINT,
        issuer: ISSUER,
        jwks,
        onIssuedTokens,
        retrieveRefreshToken,
        revocationEndpoint: REVOCATION_ENDPOINT,
        userinfoEndpoint: USERINFO_ENDPOINT
      })

      const response = await fastify.inject({
        method: 'POST',
        url: '/token',
        body: {}
      })

      t.assert.strictEqual(response.statusCode, 400)
    })
  })

  describe('POST /token', () => {
    // The required parameters for the POST request to the token endpoint are
    // listed here:
    // https://indieauth.spec.indieweb.org/#redeeming-the-authorization-code
    it('returns HTTP 400 (invalid_request) when request body has no client_id', async (t) => {
      const fastify = Fastify()

      await fastify.register(tokenEndpoint, {
        includeErrorDescription: true,
        isAccessTokenRevoked,
        authorizationEndpoint: AUTHORIZATION_ENDPOINT,
        issuer: ISSUER,
        jwks,
        onIssuedTokens,
        retrieveRefreshToken,
        revocationEndpoint: REVOCATION_ENDPOINT,
        userinfoEndpoint: USERINFO_ENDPOINT
      })

      const response = await fastify.inject({
        method: 'POST',
        url: '/token',
        body: {}
      })

      const res = await response.json()

      t.assert.strictEqual(response.statusCode, 400)
      t.assert.strictEqual(res.error, 'invalid_request')
      t.assert.ok(res.error_description.includes('body must have'))
    })

    it('returns HTTP 500 (server_error) when it fails to fetch the authorization endpoint', async (t) => {
      const fastify = Fastify()

      await fastify.register(tokenEndpoint, {
        includeErrorDescription: true,
        isAccessTokenRevoked,
        authorizationEndpoint: AUTHORIZATION_ENDPOINT,
        issuer: ISSUER,
        jwks,
        onIssuedTokens,
        retrieveRefreshToken,
        revocationEndpoint: REVOCATION_ENDPOINT,
        userinfoEndpoint: USERINFO_ENDPOINT
      })

      const body = {
        client_id: CLIENT_ID_NONEXISTENT,
        code: code_valid,
        code_verifier: code_verifier_valid,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI_NONEXISTENT
      }

      const response = await fastify.inject({
        method: 'POST',
        url: '/token',
        body
      })

      const res = await response.json()

      t.assert.strictEqual(response.statusCode, 500)
      t.assert.strictEqual(res.error, 'server_error')
      t.assert.ok(res.error_description.includes(AUTHORIZATION_ENDPOINT))
      t.assert.ok(res.error_description.includes('fetch failed'))
    })
  })
})
