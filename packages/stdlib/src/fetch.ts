import { log, type Log } from './log.js'

export interface Options {
  log?: Log
  maxRedirects?: number
}

export const defaults = {
  log,
  // By default, fetch follows up to 20 redirects before failing.
  // https://fetch.spec.whatwg.org/#http-redirect-fetch
  maxRedirects: 20
}

export const fetchWithManualRedirects = async (
  url: URL | string,
  options?: Options
) => {
  const config = Object.assign({}, defaults, options)

  const { log, maxRedirects } = config

  let redirectCount = 0
  while (redirectCount < maxRedirects) {
    if (typeof url === 'string') {
      url = new URL(url)
    }

    if (redirectCount > 0) {
      log.debug(`fetch ${url.href} (redirected ${redirectCount} times)`)
    } else {
      log.debug(`fetch ${url.href}`)
    }

    const response = await fetch(url.href, { redirect: 'manual' })

    if (![301, 302, 303, 307, 308].includes(response.status)) {
      return response
    }

    let location = response.headers.get('location')
    if (!location) {
      throw new Error(
        `Redirect response (${response.status}) missing "Location" header`
      )
    }

    log.warn({ from: url.href, location }, `user-agent was redirected`)

    location = location.endsWith('/') ? location : `${location}/`
    url = new URL(location, url) // resolve relative redirects

    redirectCount++
  }

  throw new Error(`Too many redirects (${redirectCount})`)
}
