import { describe, it, before, after } from 'node:test'
import canonicalUrl from '@jackdbd/canonical-url'
import { unixTimestampInSeconds } from '@jackdbd/indieauth'
import { codeVerifier, codeChallenge } from '@jackdbd/pkce'
import Fastify from 'fastify'
import { nanoid } from 'nanoid'
import authorizationEndpoint from '../lib/index.js'

let fastify

const port = 8080
const client_id_valid = `http://localhost:${port}/id`
const client_name = 'Test client'
const client_uri = `http://localhost:${port}`
const logo_uri = 'https://indiebookclub.biz/images/book.svg'

const code_invalid = nanoid(32)
const code_expired = nanoid(32)
const code_with_no_scope = nanoid(32)
const code_with_scope = nanoid(32)

const code_challenge_method_valid = 'S256'

const code_verifier_valid = codeVerifier({ len: 43, seed: 123 })
const code_verifier_invalid = codeVerifier({ len: 43, seed: 456 })

const me_valid = canonicalUrl('giacomodebidda.com')

const redirect_uri_valid = canonicalUrl(`${client_id_valid}auth/callback`)

const scope_valid = 'create update delete undelete profile email'

const onAuthorizationCodeVerified = async (_code) => {
  // update a record about the authorization code (e.g. mark the code as used)
}

const onUserApprovedRequest = async (_props) => {
  // persist a record about the authorization code
}

const retrieveAuthorizationCode = async (code) => {
  let code_verifier = code_verifier_valid
  let exp = unixTimestampInSeconds() + 1000
  let scope = scope_valid

  switch (code) {
    case code_with_scope: {
      break
    }
    case code_expired: {
      exp = 1
      break
    }
    case code_with_no_scope: {
      scope = undefined
      //   scope = ''
      break
    }
    default: {
      code_verifier = code_verifier_invalid
    }
  }

  const record = {
    client_id: client_id_valid,
    code_challenge: codeChallenge({ code_verifier, method: 'S256' }),
    exp,
    redirect_uri: redirect_uri_valid,
    code_challenge_method: code_challenge_method_valid,
    me: me_valid,
    scope
  }

  return record
}

describe('authorization-endpoint POST /auth', () => {
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
        redirect_uris: [redirect_uri_valid]
      })
    })

    await fastify.ready()
  })

  after(async () => {
    await fastify.close()
  })

  it('returns HTTP 400 (invalid_grant) when the authorization code is invalid', async (t) => {
    const body = {
      client_id: client_id_valid,
      code: code_invalid,
      code_verifier: code_verifier_valid,
      grant_type: 'authorization_code',
      redirect_uri: redirect_uri_valid
    }

    const response = await fastify.inject({
      method: 'POST',
      url: '/auth',
      body
    })

    const res = await response.json()

    t.assert.strictEqual(response.statusCode, 400)
    t.assert.strictEqual(res.error, 'invalid_grant')
    t.assert.ok(res.error_description.includes('code_challenge'))
  })

  it('returns HTTP 400 (invalid_grant) when the authorization code is expired', async (t) => {
    const body = {
      client_id: client_id_valid,
      code: code_expired,
      code_verifier: code_verifier_valid,
      grant_type: 'authorization_code',
      redirect_uri: redirect_uri_valid
    }

    const response = await fastify.inject({
      method: 'POST',
      url: '/auth',
      body
    })

    const res = await response.json()

    t.assert.strictEqual(response.statusCode, 400)
    t.assert.strictEqual(res.error, 'invalid_grant')
    t.assert.ok(res.error_description.includes('expired'))
  })

  it(`returns HTTP 200 and a response body with 'me', when the authorization code has no scope (profile URL response)`, async (t) => {
    const body = {
      client_id: client_id_valid,
      code: code_with_no_scope,
      code_verifier: code_verifier_valid,
      grant_type: 'authorization_code',
      redirect_uri: redirect_uri_valid
    }

    const response = await fastify.inject({
      method: 'POST',
      url: '/auth',
      body
    })

    const res = await response.json()

    t.assert.strictEqual(response.statusCode, 200)
    t.assert.strictEqual(res.me, me_valid)
  })

  it(`returns HTTP 200 and a response body with 'me' and 'scope', when the authorization code has scopes`, async (t) => {
    const body = {
      client_id: client_id_valid,
      code: code_with_scope,
      code_verifier: code_verifier_valid,
      grant_type: 'authorization_code',
      redirect_uri: redirect_uri_valid
    }

    const response = await fastify.inject({
      method: 'POST',
      url: '/auth',
      body
    })

    const res = await response.json()

    t.assert.strictEqual(response.statusCode, 200)
    t.assert.strictEqual(res.me, me_valid)
    t.assert.strictEqual(res.scope, scope_valid)
  })
})
