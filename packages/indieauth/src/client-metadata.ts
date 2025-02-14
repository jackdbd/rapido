import canonicalUrl from '@jackdbd/canonical-url'
import type { ClientMetadata } from './schemas/client-metadata.js'
import { htmlToClientMetadata } from './parse-h-x-app.js'

interface Options {
  debug?: boolean
  requireMicroformatApp?: boolean
}

const defaults: Partial<Options> = {
  debug: false,
  requireMicroformatApp: false
}

/**
 * Fetches the IndieAuth client metadata.
 *
 * Clients SHOULD publish an OAuth Client ID Metadata Document (a JSON document)
 * at the client identifier URL. The authorization server SHOULD fetch the URL
 * to find more information about the client.
 *
 * @see [Client Metadata - IndieAuth spec](https://indieauth.spec.indieweb.org/#client-metadata)
 * @see [OAuth Client ID Metadata Document](https://datatracker.ietf.org/doc/html/draft-parecki-oauth-client-id-metadata-document)
 * @see [RFC7591 - OAuth 2.0 Dynamic Client Registration Protocol](https://datatracker.ietf.org/doc/html/rfc7591)
 */
export const clientMetadata = async (client_id: string, options?: Options) => {
  const url = canonicalUrl(client_id)
  const opt = Object.assign({}, defaults, options)
  const { debug, requireMicroformatApp } = opt

  let response: Response
  try {
    response = await fetch(url, { method: 'GET' })
  } catch (ex: any) {
    return { error: new Error(`Failed to fetch ${url}: ${ex.message}`) }
  }

  if (!response.ok) {
    const details = `${response.statusText} (${response.status})`
    return { error: new Error(`Failed to fetch ${url}: ${details}`) }
  }

  const content_type = response.headers.get('content-type')

  if (content_type && content_type.includes('text/html')) {
    try {
      if (debug) {
        console.log(`trying to retrieve client metadata from HTML at ${url}`)
      }
      const html = await response.text()
      const { error, value: metadata } = htmlToClientMetadata(html, {
        debug,
        requireMicroformatApp,
        url
      })
      if (error) {
        return {
          error: new Error(
            `Failed to retrieve client metadata from ${url}: ${error.message}`
          )
        }
      }
      return { value: metadata }
    } catch (ex: any) {
      return {
        error: new Error(
          `Failed to retrieve client metadata from ${url}: ${ex.message}`
        )
      }
    }
  }

  try {
    if (debug) {
      console.log(`trying to retrieve client metadata from JSON at ${url}`)
    }
    const metadata: ClientMetadata = await response.json()
    return { value: metadata }
  } catch (ex: any) {
    return { error: new Error(`Failed to parse JSON response: ${ex.message}`) }
  }
}
