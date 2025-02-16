import { describe, it } from 'node:test'
import Fastify from 'fastify'
import syndicateEndpoint from '../lib/index.js'

describe('syndicate-endpoint plugin register', () => {
  it('fails if no options are passed', async (t) => {
    const fastify = Fastify()

    fastify.register(syndicateEndpoint)

    try {
      await fastify.ready()
      t.assert.fail('Plugin should have failed to register without options')
    } catch (err) {
      t.assert.ok(err, 'Expected an error to be thrown')
      console.log('🚀 ~ it ~ err:', err)
      // t.assert.match(err.message, /.+onSuccess is required/i)
    } finally {
      await fastify.close()
    }
  })

  it.todo('succeeds if the user provides: functionFoo, constantBar, etc...')

  it.todo('adds a POST /syndicate route')
})
