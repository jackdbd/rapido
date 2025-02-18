import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fastifyRequestContext from '@fastify/request-context'
import view from '@fastify/view'
import authorizationEndpoint from '@jackdbd/fastify-authorization-endpoint'
import introspectionEndpoint from '@jackdbd/fastify-introspection-endpoint'
import mediaEndpoint from '@jackdbd/fastify-media-endpoint'
import micropubEndpoint from '@jackdbd/fastify-micropub-endpoint'
import revocationEndpoint from '@jackdbd/fastify-revocation-endpoint'
// import syndicateEndpoint from '@jackdbd/fastify-syndicate-endpoint'
import tokenEndpoint from '@jackdbd/fastify-token-endpoint'
import userinfoEndpoint from '@jackdbd/fastify-userinfo-endpoint'
import Fastify from 'fastify'
import nunjucks from 'nunjucks'
import type { Environment } from 'nunjucks'
import { tap } from './nunjucks/filters.js'
import {
  createPost,
  deleteMedia,
  deletePost,
  isAccessTokenRevoked,
  isRefreshTokenRevoked,
  jf2ToWebsiteUrl,
  onAuthorizationCodeVerified,
  onIssuedTokens,
  onUserApprovedRequest,
  retrieveAccessToken,
  retrieveAuthorizationCode,
  retrieveRefreshToken,
  retrieveUserProfile,
  revokeAccessToken,
  revokeRefreshToken,
  undeletePost,
  updatePost,
  uploadMedia
} from './user-provided-functions.js'
import {
  jwks,
  jwks_url as jwksUrl
} from '../../../packages/stdlib/lib/test-utils.js'
import type { Config } from './config.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const defFastify = (config: Config) => {
  const {
    authorization_endpoint,
    includeErrorDescription,
    issuer,
    log_level,
    me,
    media_endpoint,
    micropub_endpoint,
    reportAllAjvErrors,
    revocation_endpoint,
    syndicate_to,
    userinfo_endpoint
  } = config

  const fastify = Fastify({
    logger: {
      // https://getpino.io/#/docs/help?id=level-string
      formatters: {
        level: (label) => {
          return {
            level: label
          }
        }
      },
      level: log_level
    }
  })

  const logPrefix = '[app] '

  const custom_header_filepath = path.join(
    __dirname,
    '..',
    'components',
    'custom-header.webc'
  )

  // === PLUGINS ============================================================ //
  fastify.register(fastifyRequestContext)

  fastify.register(authorizationEndpoint, {
    // authorizationCodeExpiration: "180 seconds",
    components: {
      'the-header': custom_header_filepath
    },
    includeErrorDescription,
    issuer,
    onAuthorizationCodeVerified,
    onUserApprovedRequest,
    reportAllAjvErrors,
    retrieveAuthorizationCode
  })

  fastify.register(introspectionEndpoint, {
    includeErrorDescription,
    isAccessTokenRevoked,
    isRefreshTokenRevoked,
    issuer,
    me,
    jwksUrl,
    retrieveAccessToken,
    retrieveRefreshToken
  })

  fastify.register(micropubEndpoint, {
    createPost,
    deletePost,
    includeErrorDescription,
    isAccessTokenRevoked,
    jf2ToWebsiteUrl,
    me,
    mediaEndpoint: media_endpoint,
    micropubEndpoint: micropub_endpoint,
    reportAllAjvErrors,
    syndicateTo: syndicate_to,
    undeletePost,
    updatePost
  })

  fastify.register(mediaEndpoint, {
    deleteMedia,
    includeErrorDescription,
    isAccessTokenRevoked,
    me,
    uploadMedia
  })

  fastify.register(revocationEndpoint, {
    includeErrorDescription,
    isAccessTokenRevoked,
    issuer,
    me,
    jwksUrl,
    retrieveAccessToken,
    retrieveRefreshToken,
    revokeAccessToken,
    revokeRefreshToken
  })

  fastify.register(tokenEndpoint, {
    accessTokenExpiration: '24 hours',
    authorizationEndpoint: authorization_endpoint,
    includeErrorDescription,
    isAccessTokenRevoked,
    issuer,
    jwks,
    onIssuedTokens,
    retrieveRefreshToken,
    revocationEndpoint: revocation_endpoint,
    userinfoEndpoint: userinfo_endpoint
  })

  fastify.register(userinfoEndpoint, {
    includeErrorDescription,
    isAccessTokenRevoked,
    retrieveUserProfile
  })

  // https://github.com/fastify/point-of-view?tab=readme-ov-file#migrating-from-view-to-viewasync
  fastify.register(view, {
    engine: { nunjucks },
    templates: [path.join(__dirname, '..', 'templates')],
    options: {
      onConfigure: (env: Environment) => {
        const xs = [{ name: 'tap', fn: tap }]
        xs.forEach(({ name, fn }) => env.addFilter(name, fn))
        const filters = xs.map(({ name }) => name).join(', ')

        const gg = [{ name: 'foo', value: 'bar' }]
        gg.forEach(({ name, value }) => env.addGlobal(name, value))
        const globals = gg.map(({ name }) => name).join(', ')

        fastify.log.debug(
          { filters, globals },
          `${logPrefix}configured nunjucks environment`
        )
      }
    }
  })

  // === DECORATORS ========================================================= //

  // === HOOKS ============================================================== //

  // === ROUTES ============================================================= //
  fastify.get('/id', (_request, reply) => {
    const port = 3001
    return reply.send({
      client_id: `http://localhost:${port}/id`,
      client_name: 'Test client',
      client_uri: `http://localhost:${port}`,
      logo_uri: 'https://indiebookclub.biz/images/book.svg',
      redirect_uris: [`http://localhost:${port}/auth/callback`]
    })
  })

  fastify.get('/auth/callback', (request, reply) => {
    return reply.send({
      message: 'auth callback done',
      headers: request.headers,
      query: request.query
    })
  })

  fastify.get('/', async (_request, reply) => {
    return reply.viewAsync('home.njk', { name: 'User' })
  })

  // https://micropub.spec.indieweb.org/#querying
  fastify.get('/micropub/config', async (request, reply) => {
    const response = await fetch(`${micropub_endpoint}?q=config`, {
      method: 'GET',
      headers: {}
    })

    const payload = await response.json()
    request.log.debug(payload, `${logPrefix}micropub endpoint configuration`)

    return reply.viewAsync('success.njk', {
      title: 'Micropub config',
      description: 'Configuration for the Micropub endpoint',
      summary: 'Micropub endpoint configuration',
      payload
    })
  })

  return fastify
}

// invalid request (no query string)
// http://localhost:3001/auth

// invalid request (response_type != code)
// http://localhost:3001/auth?client_id=https://example.com/id&code_challenge=1234567890123456789012345678901234567890123&code_challenge_method=S256&me=giacomodebidda.com&redirect_uri=https://example.com/auth/callback&state=foo&response_type=token

// invalid request (client app does not exist)
// http://localhost:3001/auth?client_id=https://example.com/id&code_challenge=1234567890123456789012345678901234567890123&code_challenge_method=S256&me=giacomodebidda.com&redirect_uri=https://example.com/auth/callback&state=foo

// invalid request (redirect_uri does not match the one defined by the client app)
// http://localhost:3001/auth?client_id=https://micropub.fly.dev/id&code_challenge=1234567890123456789012345678901234567890123&code_challenge_method=S256&me=giacomodebidda.com&redirect_uri=https://example.com/auth/callback&state=foo

// invalid request (valid at the authorization endpoint, but invalid at the consent screen because it has no scope)
// http://localhost:3001/auth?client_id=https://micropub.fly.dev/id&code_challenge=1234567890123456789012345678901234567890123&code_challenge_method=S256&me=giacomodebidda.com&redirect_uri=https://micropub.fly.dev/auth/callback&state=foo

// valid request
// http://localhost:3001/auth?client_id=https://micropub.fly.dev/id&code_challenge=1234567890123456789012345678901234567890123&code_challenge_method=S256&me=giacomodebidda.com&redirect_uri=https://micropub.fly.dev/auth/callback&state=foo&scope=create
