import assert from 'node:assert'
import { before, describe, it } from 'node:test'
import Fastify from 'fastify'
import fastifyRequestContext from '@fastify/request-context'
import { accessToken } from '@jackdbd/oauth2-tokens'
import {
  ACCESS_TOKEN_EXPIRATION,
  defAjv,
  ISSUER as issuer,
  jwks,
  ME as me
} from '@repo/stdlib/test-utils'
import { defDecodeAccessToken, defValidateScope } from '../lib/index.js'

const ajv = defAjv()

const decodeAccessToken = defDecodeAccessToken({
  includeErrorDescription: true
})

const validateScopeMedia = defValidateScope({
  scope: 'media',
  includeErrorDescription: true
})

describe('validateScope', () => {
  let fastify
  before(() => {
    fastify = Fastify()

    fastify.register(fastifyRequestContext)

    fastify.get(
      '/requires-media',
      { preHandler: [decodeAccessToken, validateScopeMedia] },
      async (_request, reply) => {
        // const claims = request.requestContext.get("access_token_claims");
        return reply.send({ accessible: true })
      }
    )
  })

  it("returns HTTP 403 (insufficient_scope) when access token has no 'media' scope", async (t) => {
    const { error, value } = await accessToken({
      ajv,
      expiration: ACCESS_TOKEN_EXPIRATION,
      issuer,
      jwks,
      me,
      scope: 'create update'
    })

    assert.strictEqual(error, undefined)

    const { access_token } = value

    const response = await fastify.inject({
      method: 'GET',
      headers: {
        authorization: `Bearer ${access_token}`
      },
      url: '/requires-media'
    })

    const res = response.json()

    assert.strictEqual(response.statusCode, 403)
    assert.strictEqual(res.error, 'insufficient_scope')
  })

  it("returns HTTP 200 when access token has 'media' scope", async (t) => {
    const { error, value } = await accessToken({
      ajv,
      expiration: ACCESS_TOKEN_EXPIRATION,
      issuer,
      jwks,
      me,
      scope: 'create update media'
    })

    assert.strictEqual(error, undefined)

    const { access_token } = value

    const response = await fastify.inject({
      method: 'GET',
      headers: {
        authorization: `Bearer ${access_token}`
      },
      url: '/requires-media'
    })

    const res = response.json()

    assert.strictEqual(response.statusCode, 200)
    assert.ok(res.accessible)
  })
})
