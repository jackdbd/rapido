import { describe, it, before, after } from 'node:test'
import canonicalUrl from '@jackdbd/canonical-url'
import { codeChallenge, codeVerifier } from '@jackdbd/pkce'
import Fastify from 'fastify'
import { nanoid } from 'nanoid'
import authorizationEndpoint from '../lib/index.js'

let fastify

const port = 8080
const client_id_valid = `http://localhost:${port}/id`
const client_id_invalid = canonicalUrl('https://indieauth-client-app.com/id')
const client_name = 'Test client'
const client_uri = `http://localhost:${port}`
const logo_uri = 'https://indiebookclub.biz/images/book.svg'

const code_challenge_method_valid = 'S256'
// const code_challenge_method_invalid = 'foo'

const code_verifier_valid = codeVerifier({ len: 43, seed: 123 })
// const code_verifier_invalid = codeVerifier({ len: 43, seed: 456 })

const me_valid = canonicalUrl('giacomodebidda.com')
// const me_invalid = 'not-a-profile-url'

const onAuthorizationCodeVerified = async (_code) => {
  // update a record about the authorization code (e.g. mark the code as used)
}

const onUserApprovedRequest = async (_props) => {
  // persist a record about the authorization code
}

const retrieveAuthorizationCode = async (_code) => {
  // retrive a record about the authorization code
}

describe('authorization-endpoint GET /auth', () => {
  before(async () => {
    fastify = Fastify()

    fastify.register(authorizationEndpoint, {
      includeErrorDescription: true,
      onAuthorizationCodeVerified,
      onUserApprovedRequest,
      retrieveAuthorizationCode
    })

    fastify.get('/id', async (_request, reply) => {
      return reply.send({
        client_id: client_id_valid,
        client_name,
        client_uri,
        logo_uri,
        redirect_uris: [canonicalUrl(`${client_id_valid}auth/callback`)]
      })
    })

    await fastify.ready()

    // For the test cases that fetch client metadata (GET /id) we need an actual
    // HTTP server. Simply injecting is not enough.
    await fastify.listen({ port })
  })

  after(async () => {
    await fastify.close()
  })

  it('returns HTTP 400 (invalid_request) when querystring is empty', async (t) => {
    const query = {}

    const response = await fastify.inject({
      method: 'GET',
      url: '/auth',
      query
    })

    const res = await response.json()

    t.assert.strictEqual(response.statusCode, 400)
    t.assert.strictEqual(res.error, 'invalid_request')
    t.assert.ok(res.error_description.includes('querystring must have'))
  })

  it(`returns HTTP 400 (invalid_request) when the authorization server can't retrieve client metadata (e.g. when the IndieAuth client does not exist)`, async (t) => {
    const code_challenge = codeChallenge({
      code_verifier: code_verifier_valid,
      method: code_challenge_method_valid
    })

    const query = {
      client_id: client_id_invalid,
      code_challenge,
      code_challenge_method: code_challenge_method_valid,
      me: me_valid,
      redirect_uri: canonicalUrl(`${client_id_invalid}auth/callback`),
      state: nanoid()
    }

    const response = await fastify.inject({
      method: 'GET',
      url: '/auth',
      query
    })

    const html = await response.payload

    t.assert.strictEqual(response.statusCode, 200)
    t.assert.ok(html.includes('invalid_request'))
    t.assert.ok(html.includes('Cannot retrieve metadata'))
  })

  it('returns an HTML page with a consent screen and information about the IndieAuth client application, when the IndieAuth client exists', async (t) => {
    const code_challenge = codeChallenge({
      code_verifier: code_verifier_valid,
      method: code_challenge_method_valid
    })
    const state = nanoid()

    const client_id = client_id_valid
    const redirect_uri = canonicalUrl(`${client_id_valid}auth/callback`)

    const query = {
      client_id,
      code_challenge,
      code_challenge_method: code_challenge_method_valid,
      me: me_valid,
      redirect_uri,
      state
    }

    const response = await fastify.inject({
      method: 'GET',
      url: '/auth',
      query
    })

    const html = await response.payload

    t.assert.strictEqual(response.statusCode, 200)
    t.assert.ok(html.includes('consent'))
    t.assert.ok(html.includes(client_id))
    t.assert.ok(html.includes(redirect_uri))
    t.assert.ok(html.includes(code_challenge))
    t.assert.ok(html.includes(state))
  })
})
