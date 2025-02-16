import { describe, it } from 'node:test'
import Fastify from 'fastify'
import micropubEndpoint from '../lib/index.js'

describe('micropub-endpoint plugin register', () => {
  it('fails if no options are passed', async (t) => {
    const fastify = Fastify()

    fastify.register(micropubEndpoint)

    try {
      await fastify.ready()
      t.assert.fail('Plugin should have failed to register without options')
    } catch (err) {
      t.assert.ok(err, 'Expected an error to be thrown')
      // t.assert.match(err.message, /.+create is required/i)
      // t.assert.match(err.message, /.+createPost is required/i)
    } finally {
      await fastify.close()
    }
  })

  it.todo('succeeds if the user provides: createPost, updatePost, etc...')

  it.todo('adds a GET /micropub route')

  it.todo('adds a POST /micropub route')
})
