import { describe, it } from 'node:test'
import Fastify from 'fastify'
import fastifyRequestContext from '@fastify/request-context'
import { accessToken } from '@jackdbd/indieauth'
import { defAjv } from '@repo/stdlib'
import {
  ACCESS_TOKEN_EXPIRATION,
  ISSUER as issuer,
  jwks,
  ME as me,
  PROFILE_EMAIL,
  PROFILE_NAME,
  PROFILE_PHOTO,
  PROFILE_URL
} from '@repo/stdlib/test-utils'
import userinfoEndpoint from '../lib/index.js'

const ajv = defAjv()

const isAccessTokenRevoked = async (_jti) => {
  // console.log(`verify whether access token jti=${jti} is revoked or not`);
  return false
}

const retrieveUserProfile = async (me) => {
  console.log(`retrieve record about user profile me=${me}`)
  const record = {
    email: PROFILE_EMAIL,
    name: PROFILE_NAME,
    photo: PROFILE_PHOTO,
    url: PROFILE_URL
  }
  return record
}

describe('userinfo-endpoint plugin', () => {
  describe('registration', () => {
    it('adds a GET /userinfo route', async (t) => {
      const fastify = Fastify()

      await fastify.register(userinfoEndpoint, {
        includeErrorDescription: true,
        isAccessTokenRevoked,
        me,
        retrieveUserProfile
      })

      const response = await fastify.inject({
        method: 'GET',
        url: '/userinfo'
      })

      t.assert.strictEqual(response.statusCode, 401)
    })
  })

  describe('GET /userinfo', () => {
    it('returns HTTP 401 (invalid_token) when the access token is invalid', async (t) => {
      const fastify = Fastify()

      fastify.register(fastifyRequestContext)

      await fastify.register(userinfoEndpoint, {
        includeErrorDescription: true,
        isAccessTokenRevoked,
        me,
        retrieveUserProfile
      })

      const response = await fastify.inject({
        method: 'GET',
        headers: { authorization: `Bearer foo` },
        url: '/userinfo'
      })

      const res = await response.json()

      t.assert.strictEqual(response.statusCode, 401)
      t.assert.strictEqual(res.error, 'invalid_token')
    })

    it("returns HTTP 403 (insufficient_scope) when the access token has no scope 'profile'", async (t) => {
      const fastify = Fastify()

      fastify.register(fastifyRequestContext)

      await fastify.register(userinfoEndpoint, {
        includeErrorDescription: true,
        isAccessTokenRevoked,
        me,
        retrieveUserProfile
      })

      const { value } = await accessToken({
        ajv,
        expiration: ACCESS_TOKEN_EXPIRATION,
        issuer,
        jwks,
        me,
        scope: 'create update'
      })

      const { access_token } = value

      const response = await fastify.inject({
        method: 'GET',
        headers: { authorization: `Bearer ${access_token}` },
        url: '/userinfo'
      })

      const res = await response.json()

      t.assert.strictEqual(response.statusCode, 403)
      t.assert.strictEqual(res.error, 'insufficient_scope')
    })

    it("returns HTTP 200 and a response body with `name`, `photo`, `url` (but not email), when the access token has scope 'profile'", async (t) => {
      const fastify = Fastify()

      fastify.register(fastifyRequestContext)

      await fastify.register(userinfoEndpoint, {
        includeErrorDescription: true,
        isAccessTokenRevoked,
        me,
        retrieveUserProfile
      })

      const { value } = await accessToken({
        ajv,
        expiration: ACCESS_TOKEN_EXPIRATION,
        issuer,
        jwks,
        me,
        scope: 'create update profile'
      })

      const { access_token } = value

      const response = await fastify.inject({
        method: 'GET',
        headers: { authorization: `Bearer ${access_token}` },
        url: '/userinfo'
      })

      const res = await response.json()

      t.assert.strictEqual(response.statusCode, 200)
      t.assert.strictEqual(res.email, undefined)
      t.assert.strictEqual(res.name, PROFILE_NAME)
      t.assert.strictEqual(res.photo, PROFILE_PHOTO)
      t.assert.strictEqual(res.url, PROFILE_URL)
    })

    it("returns HTTP 200 and a response body with `email`, `name`, `photo`, `url`, when the access token has scope 'profile email'", async (t) => {
      const fastify = Fastify()

      fastify.register(fastifyRequestContext)

      await fastify.register(userinfoEndpoint, {
        includeErrorDescription: true,
        isAccessTokenRevoked,
        me,
        retrieveUserProfile
      })

      const { value } = await accessToken({
        ajv,
        expiration: ACCESS_TOKEN_EXPIRATION,
        issuer,
        jwks,
        me,
        scope: 'create update profile email'
      })

      const { access_token } = value

      const response = await fastify.inject({
        method: 'GET',
        headers: { authorization: `Bearer ${access_token}` },
        url: '/userinfo'
      })

      const res = await response.json()

      t.assert.strictEqual(response.statusCode, 200)
      t.assert.strictEqual(res.email, PROFILE_EMAIL)
      t.assert.strictEqual(res.name, PROFILE_NAME)
      t.assert.strictEqual(res.photo, PROFILE_PHOTO)
      t.assert.strictEqual(res.url, PROFILE_URL)
    })
  })
})
