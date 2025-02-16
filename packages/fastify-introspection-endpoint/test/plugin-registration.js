import { describe, it } from 'node:test'
import Fastify from 'fastify'
import canonicalUrl from '@jackdbd/canonical-url'
import { jwks_url as jwksUrl } from '@repo/stdlib/test-utils'
import introspectionEndpoint from '../lib/index.js'

const issuer = 'https://authorization-server.com/'
const me = canonicalUrl('end-user.com')

const isAccessTokenRevoked = async (_jti) => {
  // verify whether access token jti=${jti} is revoked or not
  return false
}

const isRefreshTokenRevoked = async (_refresh_token) => {
  // verify whether refresh token ${refresh_token} is revoked or not
  return false
}

const retrieveAccessToken = async (_jti) => {
  // retrieve record about access token
  const record = {} // client_id, redirect_uri, scope, etc...
  return record
}

const retrieveRefreshToken = async (_token_id) => {
  // retrieve record about refresh token
  const record = {} // client_id, redirect_uri, scope, etc...
  return record
}

describe('introspection-endpoint plugin register', () => {
  it('fails if no options are passed', async (t) => {
    const fastify = Fastify()

    fastify.register(introspectionEndpoint)

    try {
      await fastify.ready()
      t.assert.fail('Plugin should have failed to register without options')
    } catch (err) {
      t.assert.ok(err, 'Expected an error to be thrown')
      t.assert.match(err.message, /.+isAccessTokenRevoked is required/i)
    } finally {
      await fastify.close()
    }
  })

  it('succeeds if the user provides: isAccessTokenRevoked, retrieveAccessToken, retrieveRefreshToken, issuer, jwksUrl, me', async (t) => {
    const fastify = Fastify()

    fastify.register(introspectionEndpoint, {
      isAccessTokenRevoked,
      isRefreshTokenRevoked,
      retrieveAccessToken,
      retrieveRefreshToken,
      issuer,
      jwksUrl,
      me
    })

    try {
      await fastify.ready()
      t.assert.ok('Plugin registered successfully')
    } catch (err) {
      t.assert.fail(`Plugin failed to register: ${err.message}`)
    } finally {
      await fastify.close()
    }
  })

  it('adds a POST /introspect route', async (t) => {
    const fastify = Fastify()

    fastify.register(introspectionEndpoint, {
      isAccessTokenRevoked,
      isRefreshTokenRevoked,
      retrieveAccessToken,
      retrieveRefreshToken,
      issuer,
      jwksUrl,
      me
    })

    await fastify.ready()

    const response = await fastify.inject({
      method: 'POST',
      url: '/introspect'
    })
    t.assert.strictEqual(response.statusCode, 400)

    await fastify.close()
  })
})
