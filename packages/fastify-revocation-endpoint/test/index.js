import { describe, it } from 'node:test'
import Fastify from 'fastify'
import fastifyRequestContext from '@fastify/request-context'
import { accessToken } from '@jackdbd/oauth2-tokens'
import {
  CLIENT_ID_NONEXISTENT as client_id,
  defAjv,
  ISSUER as issuer,
  jwks,
  jwks_url as jwksUrl,
  ME as me,
  SCOPE as scope
} from '@repo/stdlib/test-utils'
import revokeEndpoint from '../lib/index.js'

const ajv = defAjv()

const isAccessTokenRevoked = async (_jti) => {
  // console.log(`verify whether access token jti=${jti} is revoked or not`);
  return false
}

const retrieveAccessToken = async (_jti) => {
  // console.log(`retrieve record about access token jti=${jti}`);
  const record = { client_id }
  return record
}

const retrieveRefreshToken = async (_refresh_token) => {
  // console.log(`retrieve record about refresh token ${refresh_token}`);
  const record = { client_id, exp: 1, me }
  return record
}

const revokeAccessToken = async (_props) => {
  // const { revocation_reason, jti } = props;
  // console.log(`revoke access token jti=${jti}: ${revocation_reason}`);
}

const revokeRefreshToken = async (_props) => {
  // const { revocation_reason, refresh_token } = props;
  // console.log(`revoke refresh token ${refresh_token}: ${revocation_reason}`);
}

describe('revocation-endpoint plugin', () => {
  describe('registration', () => {
    it('adds a POST /revoke route', async (t) => {
      const fastify = Fastify()

      await fastify.register(revokeEndpoint, {
        includeErrorDescription: true,
        isAccessTokenRevoked,
        issuer,
        jwksUrl,
        me,
        retrieveAccessToken,
        retrieveRefreshToken,
        revokeAccessToken,
        revokeRefreshToken
      })

      const response = await fastify.inject({
        method: 'POST',
        url: '/revoke',
        body: {}
      })

      t.assert.strictEqual(response.statusCode, 400)
    })
  })

  describe('POST /revoke', () => {
    it('returns HTTP 200 even when request body has an invalid token', async (t) => {
      const fastify = Fastify()

      fastify.register(fastifyRequestContext)

      await fastify.register(revokeEndpoint, {
        includeErrorDescription: true,
        isAccessTokenRevoked,
        issuer,
        jwksUrl,
        me,
        retrieveAccessToken,
        retrieveRefreshToken,
        revokeAccessToken,
        revokeRefreshToken
      })

      const { value } = await accessToken({
        ajv,
        expiration: '5 minutes',
        issuer,
        jwks,
        me,
        scope
      })

      const { access_token } = value

      const response = await fastify.inject({
        method: 'POST',
        url: '/revoke',
        headers: { authorization: `Bearer ${access_token}` },
        body: { token: 'foo' }
      })

      t.assert.strictEqual(response.statusCode, 200)
    })

    it.skip('returns HTTP 200 when request body has a valid token', async (t) => {
      const fastify = Fastify()

      fastify.register(fastifyRequestContext)

      await fastify.register(revokeEndpoint, {
        includeErrorDescription: true,
        isAccessTokenRevoked,
        issuer,
        jwksUrl,
        me,
        retrieveAccessToken,
        retrieveRefreshToken,
        revokeAccessToken,
        revokeRefreshToken
      })

      const { value } = await accessToken({
        ajv,
        expiration: '5 minutes',
        issuer,
        jwks,
        me,
        scope
      })

      const { access_token } = value

      const response = await fastify.inject({
        method: 'POST',
        url: '/revoke',
        headers: { authorization: `Bearer ${access_token}` },
        body: { token: access_token, token_type_hint: 'access_token' }
      })

      const res = await response.json()

      t.assert.strictEqual(response.statusCode, 200)
      t.assert.ok(res.message.includes('Access token'))
      t.assert.ok(res.message.includes('revoked'))
    })
  })
})
