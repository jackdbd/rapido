import { isExpired, msToUTCString } from '@jackdbd/indieauth'
import type { AccessTokenClaims } from '@jackdbd/indieauth'
import type { RequestContextData } from '@fastify/request-context'
import type { preHandlerHookHandler } from 'fastify'

export interface Options {
  logPrefix?: string
  requestContextKey?: string
}

const defaults: Partial<Options> = {
  logPrefix: '[log claims] ',
  requestContextKey: 'access_token_claims'
}

export const defLogClaims = (options?: Options) => {
  const config = Object.assign({}, defaults, options) as Required<Options>

  const ctx_key = config.requestContextKey as keyof RequestContextData

  const { logPrefix } = config

  if (!ctx_key) {
    throw new Error('requestContextKey is required')
  }

  const logClaims: preHandlerHookHandler = (request, _reply, done) => {
    request.log.debug(
      `${logPrefix}get access token claims from request context key '${ctx_key}'`
    )

    const claims = request.requestContext.get(ctx_key) as AccessTokenClaims

    if (!claims) {
      const message = `no access token claims in request context, under key '${ctx_key}'`
      request.log.debug(`${logPrefix}${message}`)
      return done()
    }

    // Some token endpoint might issue a token that has `issued_at` in its
    // claims. Some other times we find `iat` in claims. Point to the relevant
    // documentation of various token endpoints (e.g. this app, IndieLogin.com).
    const iat_utc = msToUTCString(claims.iat * 1000)
    const exp_utc = msToUTCString(claims.exp * 1000)

    const messages = [
      `access token issued by ${claims.iss} at UNIX timestamp ${claims.iat} (${iat_utc})`
    ]

    const expired = isExpired(claims.exp)
    if (expired) {
      messages.push(`expired at UNIX timestamp ${claims.exp} (${exp_utc})`)
    } else {
      messages.push(`will expire at UNIX timestamp ${claims.exp} (${exp_utc})`)
    }

    request.log.debug(`${logPrefix}${messages.join('; ')} `)

    return done()
  }

  return logClaims
}
