import { describe, it } from 'node:test'
import Fastify from 'fastify'
import { defErrorHandler } from '../lib/index.js'

const fastifyInstance = () => {
  const fastify = Fastify()

  fastify.get('/exception', async (_request, _reply) => {
    throw new Error('this is the error_description')
  })

  return fastify
}

describe('production error handler', () => {
  it('does not include error_description by default', async (t) => {
    const fastify = fastifyInstance()
    fastify.setErrorHandler(defErrorHandler())

    const response = await fastify.inject({ method: 'GET', url: '/exception' })
    const res = await response.json()

    t.assert.strictEqual(response.statusCode, 500)
    t.assert.strictEqual(res.error, 'server_error')
    t.assert.strictEqual(res.error_description, undefined)
  })

  it('includes error_description when the option `includeErrorDescription` is set to true', async (t) => {
    const fastify = fastifyInstance()
    fastify.setErrorHandler(defErrorHandler({ includeErrorDescription: true }))

    const response = await fastify.inject({ method: 'GET', url: '/exception' })
    const res = await response.json()

    t.assert.strictEqual(response.statusCode, 500)
    t.assert.strictEqual(res.error, 'server_error')
    t.assert.strictEqual(res.error_description, 'this is the error_description')
  })
})
