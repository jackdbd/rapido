import assert from 'node:assert'
import { before, describe, it } from 'node:test'
import { accessToken } from '@jackdbd/indieauth'
import {
  defAjv,
  ACCESS_TOKEN_EXPIRATION,
  ISSUER,
  jwks,
  ME,
  SCOPE
} from '@repo/stdlib/test-utils'
import Fastify from 'fastify'
import fastifyRequestContext from '@fastify/request-context'
import { defDecodeAccessToken } from '../lib/index.js'

const issuer = ISSUER
const me = ME
const scope = SCOPE

const ajv = defAjv()

const decodeAccessToken = defDecodeAccessToken({
  includeErrorDescription: true
})

describe('decodeAccessToken', () => {
  let fastify
  before(() => {
    fastify = Fastify()

    fastify.register(fastifyRequestContext)

    fastify.get('/without-hook', { preHandler: [] }, async (request, reply) => {
      const claims = request.requestContext.get('access_token_claims')

      assert.strictEqual(claims, undefined)

      return reply.send({ done: true })
    })

    fastify.get(
      '/with-hook',
      { preHandler: [decodeAccessToken] },
      async (request, reply) => {
        const claims = request.requestContext.get('access_token_claims')

        assert.strictEqual(claims.me, me)
        assert.strictEqual(claims.iss, issuer)
        assert.strictEqual(claims.scope, scope)
        assert.ok(claims.exp)
        assert.ok(claims.iat)
        assert.ok(claims.jti)

        return reply.send({ done: true })
      }
    )
  })

  it('when not added to a route, the request context does not contain any access token claims', async () => {
    const { error, value } = await accessToken({
      ajv,
      expiration: ACCESS_TOKEN_EXPIRATION,
      issuer,
      jwks,
      me,
      scope
    })

    assert.strictEqual(error, undefined)

    const { access_token } = value

    const response = await fastify.inject({
      method: 'GET',
      headers: {
        authorization: `Bearer ${access_token}`
      },
      url: '/without-hook'
    })

    assert.strictEqual(response.statusCode, 200)
  })

  it('decodes the access token and sets the access token claims in the request context', async () => {
    const { error, value } = await accessToken({
      ajv,
      expiration: ACCESS_TOKEN_EXPIRATION,
      issuer,
      jwks,
      me,
      scope
    })

    assert.strictEqual(error, undefined)

    const { access_token } = value

    const response = await fastify.inject({
      method: 'GET',
      headers: {
        authorization: `Bearer ${access_token}`
      },
      url: '/with-hook'
    })

    assert.strictEqual(response.statusCode, 200)
  })
})
