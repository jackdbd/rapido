import { describe, it, before, after } from 'node:test'
import fastifyRequestContext from '@fastify/request-context'
import canonicalUrl from '@jackdbd/canonical-url'
import {
  accessToken,
  safeDecode,
  unixTimestampInSeconds
} from '@jackdbd/indieauth'
import { defAjv } from '@repo/stdlib'
import { jwks, jwks_url as jwksUrl } from '@repo/stdlib/test-utils'
import Fastify from 'fastify'
import { nanoid } from 'nanoid'
import introspectionEndpoint from '../lib/index.js'

let fastify

const ajv = defAjv({ allErrors: true, schemas: [] })

const issuer = 'https://authorization-server.com/'

const me_aaron = canonicalUrl('aaronparecki.com')
const me_giacomo = canonicalUrl('giacomodebidda.com')

const client_id_indieauth_client = canonicalUrl('indieauth-client.com')
const client_id_micropub_client = canonicalUrl('micropub-client.com')

const redirect_uri_indieauth_client = canonicalUrl(
  `${client_id_indieauth_client}auth/callback`
)
const redirect_uri_micropub_client = canonicalUrl(
  `${client_id_micropub_client}auth/callback`
)

const indieauth_scopes = ['profile', 'email']
const micropub_scopes = ['create', 'update', 'delete', 'undelete']
const scope_indieauth = indieauth_scopes.join(' ')
const scope_micropub = micropub_scopes.join(' ')
const scope_all = [...micropub_scopes, ...indieauth_scopes].join(' ')

// https://jwt.io/
const access_token_expired =
  'eyJhbGciOiJSUzI1NiIsImtpZCI6InJJMnFoN0x5NzVwT09TSWNVdkdTUSJ9.eyJtZSI6Imh0dHBzOi8vZ2lhY29tb2RlYmlkZGEuY29tLyIsInNjb3BlIjoicHJvZmlsZSBlbWFpbCBjcmVhdGUgdXBkYXRlIGRlbGV0ZSB1bmRlbGV0ZSBkcmFmdCBtZWRpYSIsImV4cCI6MTczMzQ4ODYzMSwiaWF0IjoxNzMzNDg4MzMxLCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjMwMDEiLCJqdGkiOiJrOXZraXl4UXVmVHJrbU53QlRPZ1EifQ.UE2aJ5YlOiAMMVEn-gNMZu_q_JW8uvizgSpxrcicl8waL5It4eJIEixvTRlkCKBbPfgiL15kxdgbUnI618xKc05xhepDZ_C1nQD6bB1FA-9_HjaBdP1ERyvIQ7ceCqaG8RnRe3cdNu4sj8ezgcpgWBk0RbLwrrvkEw4NlS6b_p_5EF9IonpZEYYPUh_FhsvlkgrZ3NqlPw0moWzFnqc06xnHXE21Zki1WQZQDlTWmjE4VGx72VDM0mzBpwcRnQZipcolxaSmVOacmO7F4zVIrYH0amJn7szbO-xISJtG6rh1ImwJnvxNVF6tZBebUPbPDDZXOvD2E34GPAOnVuUDOA'
const jti_expired = 'k9vkiyxQufTrkmNwBTOgQ'

const refresh_token_expired = nanoid(32)
const refresh_token_revoked = nanoid(32)
const refresh_token_with_no_scope = nanoid(32)
const refresh_token_for_me_aaron = nanoid(32)
const refresh_token_for_indieauth_client = nanoid(32)
const refresh_token_for_micropub_client = nanoid(32)

const isAccessTokenRevoked = async (_jti) => {
  return false
}

const isRefreshTokenRevoked = async (refresh_token) => {
  if (refresh_token === refresh_token_revoked) {
    return true
  } else {
    return false
  }
}

const retrieveAccessToken = async (jti) => {
  switch (jti) {
    case refresh_token_expired:
    case refresh_token_for_me_aaron:
    case refresh_token_for_indieauth_client:
    case refresh_token_for_micropub_client:
    case refresh_token_with_no_scope:
    case refresh_token_revoked: {
      // throw new Error(`This is a refresh token, not an access token`)
      return undefined
    }

    default: {
      break
    }
  }

  let client_id = client_id_micropub_client
  let redirect_uri = redirect_uri_micropub_client
  let claims = {}

  if (jti === jti_expired) {
    const { error, value } = await safeDecode(access_token_expired)
    if (error) {
      throw error
    }
    claims = value
  } else {
    claims = { me: me_giacomo, scope: scope_micropub }
  }

  const record = {
    ...claims,
    client_id,
    redirect_uri
  }

  return record
}

const retrieveRefreshToken = async (refresh_token) => {
  let client_id = client_id_micropub_client
  let redirect_uri = redirect_uri_micropub_client
  let exp = unixTimestampInSeconds() + 3600 * 24 * 30
  let me = me_giacomo
  let revoked = false
  let revocation_reason = undefined
  let scope = scope_all

  switch (refresh_token) {
    case access_token_expired: {
      // throw new Error(`This is an access token, not a refresh token`)
      return undefined
    }

    case refresh_token_expired: {
      exp = 1
      break
    }

    case refresh_token_for_me_aaron: {
      me = me_aaron
      break
    }

    case refresh_token_revoked: {
      revoked = true
      revocation_reason = 'testing fastify-introspection-endpoint plugin'
      break
    }

    case refresh_token_with_no_scope: {
      scope = ''
      break
    }

    case refresh_token_for_indieauth_client: {
      client_id = client_id_indieauth_client
      redirect_uri = redirect_uri_indieauth_client
      scope = scope_indieauth
      break
    }

    default: {
      client_id = client_id_micropub_client
      redirect_uri = redirect_uri_micropub_client
      scope = scope_micropub
    }
  }

  const record = {
    client_id,
    exp,
    me,
    redirect_uri,
    revoked,
    revocation_reason,
    scope
  }

  return record
}

describe('introspection-endpoint POST /introspect', () => {
  before(async () => {
    fastify = Fastify()

    fastify.register(fastifyRequestContext)

    fastify.register(introspectionEndpoint, {
      includeErrorDescription: true,
      isAccessTokenRevoked,
      isRefreshTokenRevoked,
      retrieveAccessToken,
      retrieveRefreshToken,
      issuer,
      jwksUrl,
      me: me_giacomo
    })

    await fastify.ready()

    // For the test cases that fetch the authorization endpoint (POST /auth) we
    // need an actual HTTP server. Simply injecting is not enough.
    // await fastify.listen({ port })
  })

  after(async () => {
    await fastify.close()
  })

  it('returns HTTP 400 (invalid_request) when request body has no token', async (t) => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/introspect',
      body: {}
    })

    const res = await response.json()

    t.assert.strictEqual(response.statusCode, 400)
    t.assert.strictEqual(res.error, 'invalid_request')
    t.assert.strictEqual(
      res.error_description,
      `body must have required property 'token'`
    )
  })

  it('returns HTTP 401 (invalid_token) when request body has an invalid token', async (t) => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/introspect',
      headers: { authorization: 'Bearer abc' },
      body: { token: 'def' }
    })

    const res = await response.json()

    t.assert.strictEqual(response.statusCode, 401)
    t.assert.strictEqual(res.error, 'invalid_token')
    t.assert.strictEqual(res.error_description, `Invalid JWT`)
  })

  it('returns HTTP 200 and a response body with {active: false}, when the queried access token is expired and no token_type_hint is provided', async (t) => {
    const { value } = await accessToken({
      ajv,
      expiration: '10 seconds',
      issuer,
      jwks,
      me: me_giacomo,
      scope: scope_indieauth
    })

    const { access_token } = value

    const response = await fastify.inject({
      method: 'POST',
      url: '/introspect',
      headers: { authorization: `Bearer ${access_token}` },
      body: { token: access_token_expired }
    })

    const res = await response.json()

    t.assert.strictEqual(response.statusCode, 200)
    t.assert.strictEqual(res.active, false)
    t.assert.strictEqual(res.jti, jti_expired)
  })

  it('returns HTTP 200 and a response body with {active: false}, when the queried access token is expired and {token_type_hint: refresh_token} is provided (which is incorrect)', async (t) => {
    const { value } = await accessToken({
      ajv,
      expiration: '10 seconds',
      issuer,
      jwks,
      me: me_giacomo,
      scope: scope_indieauth
    })

    const { access_token } = value

    const response = await fastify.inject({
      method: 'POST',
      url: '/introspect',
      headers: { authorization: `Bearer ${access_token}` },
      body: { token: access_token_expired, token_type_hint: 'refresh_token' }
    })

    const res = await response.json()

    t.assert.strictEqual(response.statusCode, 200)
    t.assert.strictEqual(res.active, false)
    t.assert.strictEqual(res.jti, jti_expired)
  })

  it('returns HTTP 200 and a response body with {active: true}, `client_id`, `me` and `scope`, when the access token is valid', async (t) => {
    const { value } = await accessToken({
      ajv,
      expiration: '10 seconds',
      issuer,
      jwks,
      me: me_giacomo,
      scope: scope_indieauth
    })

    const { access_token } = value

    const response = await fastify.inject({
      method: 'POST',
      url: '/introspect',
      headers: { authorization: `Bearer ${access_token}` },
      body: { token: access_token }
    })

    const res = await response.json()

    t.assert.strictEqual(response.statusCode, 200)
    t.assert.strictEqual(res.active, true)
    t.assert.strictEqual(res.client_id, client_id_micropub_client)
    t.assert.strictEqual(res.me, me_giacomo)
    t.assert.strictEqual(res.iss, issuer)
    t.assert.ok(res.exp > 0)
    t.assert.ok(res.iat > 0)
    t.assert.strictEqual(res.scope, scope_indieauth)
    t.assert.ok(res.jti)
  })

  it('returns HTTP 200 and a response body with {active: false}, when the record retrieved about the refresh token has no scope and no token_type_hint', async (t) => {
    const { value } = await accessToken({
      ajv,
      expiration: '10 seconds',
      issuer,
      jwks,
      me: me_giacomo,
      scope: scope_all
    })

    const { access_token } = value

    const response = await fastify.inject({
      method: 'POST',
      url: '/introspect',
      headers: { authorization: `Bearer ${access_token}` },
      body: {
        token: refresh_token_with_no_scope
      }
    })

    const res = await response.json()

    t.assert.strictEqual(response.statusCode, 200)
    t.assert.strictEqual(res.active, false)
  })

  it('returns HTTP 200 and a response body with {active: false}, when the record retrieved about the refresh token has no scope and {token_type_hint: refresh_token}', async (t) => {
    const { value } = await accessToken({
      ajv,
      expiration: '10 seconds',
      issuer,
      jwks,
      me: me_giacomo,
      scope: scope_all
    })

    const { access_token } = value

    const response = await fastify.inject({
      method: 'POST',
      url: '/introspect',
      headers: { authorization: `Bearer ${access_token}` },
      body: {
        token: refresh_token_with_no_scope,
        token_type_hint: 'refresh_token'
      }
    })

    const res = await response.json()

    t.assert.strictEqual(response.statusCode, 200)
    t.assert.strictEqual(res.active, false)
  })

  it('returns HTTP 200 and a response body with {active: false}, when the record retrieved about the refresh token has no scope and {token_type_hint: access_token} (which is incorrect)', async (t) => {
    const { value } = await accessToken({
      ajv,
      expiration: '10 seconds',
      issuer,
      jwks,
      me: me_giacomo,
      scope: scope_all
    })

    const { access_token } = value

    const response = await fastify.inject({
      method: 'POST',
      url: '/introspect',
      headers: { authorization: `Bearer ${access_token}` },
      body: {
        token: refresh_token_with_no_scope,
        token_type_hint: 'refresh_token'
      }
    })

    const res = await response.json()

    t.assert.strictEqual(response.statusCode, 200)
    t.assert.strictEqual(res.active, false)
  })

  it('returns HTTP 200 and a response body with `active`, `client_id`, `me` and `scope`, when the refresh token is valid and token_type_hint is not specified', async (t) => {
    const { value } = await accessToken({
      ajv,
      expiration: '10 seconds',
      issuer,
      jwks,
      me: me_giacomo,
      scope: scope_micropub
    })

    const { access_token } = value

    const response = await fastify.inject({
      method: 'POST',
      url: '/introspect',
      headers: { authorization: `Bearer ${access_token}` },
      body: {
        token: refresh_token_for_micropub_client
      }
    })

    const res = await response.json()

    t.assert.strictEqual(response.statusCode, 200)
    t.assert.strictEqual(res.active, true)
    t.assert.strictEqual(res.client_id, client_id_micropub_client)
    t.assert.strictEqual(res.me, me_giacomo)
    t.assert.strictEqual(res.iss, undefined)
    t.assert.ok(res.exp > 0)
    t.assert.strictEqual(res.iat, undefined)
    t.assert.strictEqual(res.scope, scope_micropub)
    t.assert.strictEqual(res.jti, undefined)
  })
})
