import { describe, it } from 'node:test'
import Fastify from 'fastify'
import { nanoid } from 'nanoid'
import { codeChallenge, codeVerifier } from '@jackdbd/pkce'
import {
  CLIENT_ID_NONEXISTENT,
  ME,
  REDIRECT_URI_NONEXISTENT,
  SCOPE
} from '@repo/stdlib/test-utils'
import authorizationEndpoint from '../lib/index.js'

const code_valid = nanoid(32)
const code_invalid = nanoid(32)
const code_verifier_valid = codeVerifier({ len: 43, seed: 123 })
const code_verifier_invalid = codeVerifier({ len: 43, seed: 456 })

const port = 8080
const client_id = `http://localhost:${port}/id`
const client_name = 'Test client'
const client_uri = `http://localhost:${port}`
const logo_uri = 'https://indiebookclub.biz/images/book.svg'
const redirect_uri = `http://localhost:${port}/auth/callback`

const onAuthorizationCodeVerified = async (_code) => {
  // console.log(`mark this authorization code as used: ${code}`);
}

const onUserApprovedRequest = async (_props) => {
  // console.log(`persist a record about the authorization code`, props);
}

const retrieveAuthorizationCode = async (code) => {
  // console.log(`retrieve record about this authorization code: ${code}`);
  const code_verifier =
    code === code_valid ? code_verifier_valid : code_verifier_invalid

  const record = {
    client_id,
    code_challenge: codeChallenge({ code_verifier, method: 'S256' }),
    redirect_uri,
    code_challenge_method: 'S256',
    me: ME,
    scope: SCOPE
  }
  return record
}

describe('authorization-endpoint plugin', () => {
  describe('registration', () => {
    it('adds a GET /auth route', async (t) => {
      const fastify = Fastify()

      await fastify.register(authorizationEndpoint, {
        includeErrorDescription: true,
        onAuthorizationCodeVerified,
        onUserApprovedRequest,
        retrieveAuthorizationCode
      })

      const response = await fastify.inject({ method: 'GET', url: '/auth' })

      t.assert.strictEqual(response.statusCode, 400)
    })

    it('adds a POST /auth route', async (t) => {
      const fastify = Fastify()

      await fastify.register(authorizationEndpoint, {
        includeErrorDescription: true,
        onAuthorizationCodeVerified,
        onUserApprovedRequest,
        retrieveAuthorizationCode
      })

      const response = await fastify.inject({
        method: 'POST',
        url: '/auth',
        body: {}
      })

      t.assert.strictEqual(response.statusCode, 400)
    })
  })

  describe('GET /auth', () => {
    it('returns HTTP 400 (invalid_request) when request has no querystring', async (t) => {
      const fastify = Fastify()

      await fastify.register(authorizationEndpoint, {
        includeErrorDescription: true,
        onAuthorizationCodeVerified,
        onUserApprovedRequest,
        retrieveAuthorizationCode
      })

      const response = await fastify.inject({ method: 'GET', url: '/auth' })

      const res = await response.json()

      t.assert.strictEqual(response.statusCode, 400)
      t.assert.strictEqual(res.error, 'invalid_request')
      t.assert.ok(res.error_description.includes('querystring must have'))
    })

    it('returns HTTP 400 (invalid_request) when the IndieAuth client does not exist', async (t) => {
      const fastify = Fastify()

      await fastify.register(authorizationEndpoint, {
        includeErrorDescription: true,
        onAuthorizationCodeVerified,
        onUserApprovedRequest,
        retrieveAuthorizationCode
      })

      const code_challenge_method = 'S256'
      const code_challenge = codeChallenge({
        code_verifier: code_verifier_valid,
        method: code_challenge_method
      })
      const state = nanoid()

      const query = {
        client_id: CLIENT_ID_NONEXISTENT,
        code_challenge,
        code_challenge_method,
        me: ME,
        redirect_uri: REDIRECT_URI_NONEXISTENT,
        state
      }

      const response = await fastify.inject({
        method: 'GET',
        url: '/auth',
        query
      })

      const res = await response.json()

      t.assert.strictEqual(response.statusCode, 400)
      t.assert.strictEqual(res.error, 'invalid_request')
      t.assert.ok(res.error_description.includes('Failed to fetch metadata'))
      t.assert.strictEqual(res.state, state)
    })

    it('returns an HTML page with a consent screen and information about the IndieAuth client, when the IndieAuth client exists', async (t) => {
      const fastify = Fastify()

      await fastify.register(authorizationEndpoint, {
        includeErrorDescription: true,
        onAuthorizationCodeVerified,
        onUserApprovedRequest,
        retrieveAuthorizationCode
      })

      fastify.get('/id', async (_request, reply) => {
        return reply.send({
          client_id,
          client_name,
          client_uri,
          logo_uri,
          redirect_uris: [redirect_uri]
        })
      })

      await fastify.listen({ port })

      const code_challenge_method = 'S256'
      const code_challenge = codeChallenge({
        code_verifier: code_verifier_valid,
        method: code_challenge_method
      })
      const state = nanoid()

      const query = {
        client_id,
        code_challenge,
        code_challenge_method,
        me: ME,
        redirect_uri,
        state
      }

      const response = await fastify.inject({
        method: 'GET',
        url: '/auth',
        query
      })

      const html = response.payload

      t.assert.strictEqual(response.statusCode, 200)
      t.assert.ok(html.includes('consent'))
      t.assert.ok(html.includes(client_id))
      t.assert.ok(html.includes(redirect_uri))
      t.assert.ok(html.includes(code_challenge))
      t.assert.ok(html.includes(state))

      await fastify.close()
    })
  })

  describe('POST /auth', () => {
    it('returns HTTP 400 (invalid_grant) when the authorization code is invalid', async (t) => {
      const fastify = Fastify()

      await fastify.register(authorizationEndpoint, {
        includeErrorDescription: true,
        onAuthorizationCodeVerified,
        onUserApprovedRequest,
        retrieveAuthorizationCode
      })

      const body = {
        client_id,
        code: code_invalid,
        code_verifier: code_verifier_valid,
        grant_type: 'authorization_code',
        redirect_uri
      }

      const response = await fastify.inject({
        method: 'POST',
        url: '/auth',
        body
      })

      const res = await response.json()

      t.assert.strictEqual(response.statusCode, 400)
      t.assert.strictEqual(res.error, 'invalid_grant')
    })

    it('returns HTTP 200 and a response body with `me` and `scope`, when the authorization code is valid', async (t) => {
      const fastify = Fastify()

      await fastify.register(authorizationEndpoint, {
        includeErrorDescription: true,
        onAuthorizationCodeVerified,
        onUserApprovedRequest,
        retrieveAuthorizationCode
      })

      const body = {
        client_id,
        code: code_valid,
        code_verifier: code_verifier_valid,
        grant_type: 'authorization_code',
        redirect_uri
      }

      const response = await fastify.inject({
        method: 'POST',
        url: '/auth',
        body
      })

      const res = await response.json()

      t.assert.strictEqual(response.statusCode, 200)
      t.assert.strictEqual(res.me, ME)
      t.assert.strictEqual(res.scope, SCOPE)
    })
  })
})
