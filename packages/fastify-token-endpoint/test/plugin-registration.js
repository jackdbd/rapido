import { describe, it } from 'node:test'
import Fastify from 'fastify'
import { jwks } from '@repo/stdlib/test-utils'
import tokenEndpoint from '../lib/index.js'

const port = 8080
const authorizationEndpoint = `http://localhost:${port}/auth`
const revocationEndpoint = `http://localhost:${port}/revoke`
const userinfoEndpoint = `http://localhost:${port}/userinfo`
const issuer = 'https://authorization-server.com/'

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

describe('token-endpoint plugin register', () => {
  it('fails if no options are passed', async (t) => {
    const fastify = Fastify()

    fastify.register(tokenEndpoint)

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

  it('succeeds if the user provides: isAccessTokenRevoked, onIssuedTokens, retrieveRefreshToken, authorizationEndpoint, issuer, jwks, revocationEndpoint, userinfoEndpoint', async (t) => {
    const fastify = Fastify()

    fastify.register(tokenEndpoint, {
      isAccessTokenRevoked,
      onIssuedTokens,
      retrieveRefreshToken,
      authorizationEndpoint,
      issuer,
      jwks,
      revocationEndpoint,
      userinfoEndpoint
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

  it('adds a POST /token route', async (t) => {
    const fastify = Fastify()

    fastify.register(tokenEndpoint, {
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

    const response = await fastify.inject({ method: 'POST', url: '/token' })
    t.assert.strictEqual(response.statusCode, 400)

    await fastify.close()
  })
})
