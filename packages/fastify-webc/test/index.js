import { describe, it } from 'node:test'
import assert from 'node:assert'
import Fastify from 'fastify'
import webc from '../lib/index.js'
import { tap } from '../lib/helpers.js'

describe('fastify-webc', () => {
  it('can be registered with no options', () => {
    const fastify = Fastify()

    fastify.register(webc)

    assert.ok(true)
  })

  it('can be registered with some WebC helper functions', () => {
    const fastify = Fastify()

    fastify.register(webc, {
      helpers: [tap, { name: 'scoped-tap', fn: tap, isScoped: true }]
    })

    assert.ok(true)
  })

  it.todo('write some actual tests (probably with light-my-request)')
})
