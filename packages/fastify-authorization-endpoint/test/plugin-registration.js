import { describe, it } from 'node:test'
import Fastify from 'fastify'
import authorizationEndpoint from '../lib/index.js'

const onAuthorizationCodeVerified = async (_code) => {
  // update a record about the authorization code (e.g. mark the code as used)
}

const onUserApprovedRequest = async (_props) => {
  // persist a record about the authorization code
}

const retrieveAuthorizationCode = async (_code) => {
  // retrieve a record about the authorization code
}

describe('authorization-endpoint plugin register', () => {
  it('fails if no options are passed', async (t) => {
    const fastify = Fastify()

    fastify.register(authorizationEndpoint)

    try {
      await fastify.ready()
      t.assert.fail('Plugin should have failed to register without options')
    } catch (err) {
      t.assert.ok(err, 'Expected an error to be thrown')
      t.assert.match(err.message, /.+onAuthorizationCodeVerified is required/i)
    } finally {
      await fastify.close()
    }
  })

  it('succeeds if the user provides: onAuthorizationCodeVerified, onUserApprovedRequest, retrieveAuthorizationCode', async (t) => {
    const fastify = Fastify()

    fastify.register(authorizationEndpoint, {
      onAuthorizationCodeVerified,
      onUserApprovedRequest,
      retrieveAuthorizationCode
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

  it('adds a GET /auth route', async (t) => {
    const fastify = Fastify()

    fastify.register(authorizationEndpoint, {
      onAuthorizationCodeVerified,
      onUserApprovedRequest,
      retrieveAuthorizationCode
    })

    await fastify.ready()

    const response = await fastify.inject({ method: 'GET', url: '/auth' })
    t.assert.strictEqual(response.statusCode, 400)

    await fastify.close()
  })

  it('adds a POST /auth route', async (t) => {
    const fastify = Fastify()

    fastify.register(authorizationEndpoint, {
      onAuthorizationCodeVerified,
      onUserApprovedRequest,
      retrieveAuthorizationCode
    })

    await fastify.ready()

    const response = await fastify.inject({ method: 'POST', url: '/auth' })
    t.assert.strictEqual(response.statusCode, 400)

    await fastify.close()
  })
})
