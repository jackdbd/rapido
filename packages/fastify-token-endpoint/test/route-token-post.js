import { describe, it, before, after } from 'node:test'
import canonicalUrl from '@jackdbd/canonical-url'
import authorizationEndpointPlugin from '@jackdbd/fastify-authorization-endpoint'
import { safeDecode, unixTimestampInSeconds } from '@jackdbd/indieauth'
import { codeVerifier, codeChallenge } from '@jackdbd/pkce'
import { jwks } from '@repo/stdlib/test-utils'
import Fastify from 'fastify'
import { nanoid } from 'nanoid'
import tokenEndpoint from '../lib/index.js'

let fastify

const port = 8080
const authorizationEndpoint = `http://localhost:${port}/auth`
const revocationEndpoint = `http://localhost:${port}/revoke`
const userinfoEndpoint = `http://localhost:${port}/userinfo`
const issuer = 'https://authorization-server.com/'

// const authorizationEndpoint404 = `http://localhost:${port}/auth-not-found`
const client_id_404 = 'https://client-application.com/id'
const redirect_uri_404 = canonicalUrl(`${client_id_404}/auth/callback`)

const code_with_indieauth_scopes = nanoid(32)
const code_with_micropub_scopes = nanoid(32)

const code_verifier_valid = codeVerifier({ len: 43, seed: 123 })

const me_valid = canonicalUrl('giacomodebidda.com')

const indieauth_scopes = 'profile email'
const micropub_scopes = 'create update delete undelete'

const onAuthorizationCodeVerified = async (_code) => {
  // update a record about the authorization code (e.g. mark the code as used)
}

const onUserApprovedRequest = async (_props) => {
  // persist a record about the authorization code
}

const retrieveAuthorizationCode = async (code) => {
  let exp = unixTimestampInSeconds() + 1000
  let scope = ''

  switch (code) {
    case code_with_indieauth_scopes: {
      scope = indieauth_scopes
      break
    }
    case code_with_micropub_scopes: {
      scope = micropub_scopes
      break
    }
    default: {
      exp = 1
    }
  }

  const record = {
    client_id: client_id_404,
    code_challenge: codeChallenge({
      code_verifier: code_verifier_valid,
      method: 'S256'
    }),
    exp,
    redirect_uri: redirect_uri_404,
    code_challenge_method: 'S256',
    me: me_valid,
    scope
  }

  return record
}

const isAccessTokenRevoked = async (_jti) => {
  // verify whether access token jti=${jti} is revoked or not
  return false
}

const onIssuedTokens = async (_props) => {
  // persist a record about an access token and another record about a refresh token`
}

const retrieveRefreshToken = async (_token_id) => {
  // retrieve record about this refresh token: ${token_id}
  const record = {} // client_id, redirect_uri, scope, etc...
  return record
}

describe('token-endpoint POST /token', () => {
  before(async () => {
    fastify = Fastify()

    fastify.register(authorizationEndpointPlugin, {
      onAuthorizationCodeVerified,
      onUserApprovedRequest,
      retrieveAuthorizationCode
    })

    fastify.register(tokenEndpoint, {
      includeErrorDescription: true,
      isAccessTokenRevoked,
      onIssuedTokens,
      retrieveRefreshToken,
      authorizationEndpoint,
      issuer,
      jwks,
      revocationEndpoint,
      userinfoEndpoint
    })

    await fastify.ready()

    // For the test cases that fetch the authorization endpoint (POST /auth) we
    // need an actual HTTP server. Simply injecting is not enough.
    await fastify.listen({ port })
  })

  after(async () => {
    await fastify.close()
  })

  it('returns HTTP 400 (invalid_request) when request body has no client_id', async (t) => {
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

  it(`returns HTTP 200 and a response body with 'access_token' (short lived and with the expected claims), 'expires_in', 'token_type', 'scope', 'me', 'refresh_token' in exchange of a valid authorization code that has micropub scopes`, async (t) => {
    const body = {
      client_id: client_id_404,
      code: code_with_micropub_scopes,
      code_verifier: code_verifier_valid,
      grant_type: 'authorization_code', // TODO: test also refresh_token
      redirect_uri: redirect_uri_404
    }

    const response = await fastify.inject({
      method: 'POST',
      url: '/token',
      body
    })

    const res = await response.json()

    t.assert.strictEqual(response.statusCode, 200)
    t.assert.strictEqual(res.me, me_valid)
    t.assert.strictEqual(res.scope, micropub_scopes)
    t.assert.strictEqual(res.token_type, 'Bearer')
    t.assert.ok(res.access_token)
    t.assert.ok(res.expires_in > 0 && res.expires_in < 3600)
    t.assert.ok(res.refresh_token)

    const { error, value: claims } = await safeDecode(res.access_token)

    t.assert.equal(error, undefined)
    t.assert.strictEqual(claims.iss, issuer)
    t.assert.strictEqual(claims.me, me_valid)
    t.assert.strictEqual(claims.scope, micropub_scopes)
    t.assert.ok(claims.jti)
  })
})
