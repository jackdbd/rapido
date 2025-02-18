import canonicalUrl from '@jackdbd/canonical-url'
import { linkHeaderToLinkHref } from './parse-link-header.js'
import { htmlToLinkHref } from './parse-link-html.js'

/**
 * Discovers the user's indieauth-metadata endpoint by fetching the
 * [user's profile URL](https://indieauth.spec.indieweb.org/#user-profile-url).
 *
 * The indieauth-metadata endpoint provides the location of the IndieAuth
 * server's authorization endpoint and token endpoint, as well as other relevant
 * information for the client.
 *
 * @example https://giacomodebidda.com/.well-known/oauth-authorization-server
 * @example https://aaronparecki.com/.well-known/openid-configuration
 *
 * @see [Discovery by Clients - IndieAuth spec](https://indieauth.spec.indieweb.org/#discovery-by-clients)
 */
export const metadataEndpoint = async (me: string) => {
  const url = canonicalUrl(me)

  let response: Response
  try {
    // We are only interested in the response headers, so HEAD is enough.
    response = await fetch(url, { method: 'HEAD' })
  } catch (ex: any) {
    return { error: new Error(`Failed to fetch ${url}: ${ex.message}`) }
  }

  if (!response.ok) {
    const details = `${response.statusText} (${response.status})`
    return { error: new Error(`Failed to fetch ${url}: ${details}`) }
  }

  // TODO: follow redirects
  // Implementation example:
  // https://github.com/simonw/datasette-indieauth/blob/55b8eefa35aff9d7819fa040abf4f897aee28836/datasette_indieauth/utils.py#L109

  const link = response.headers.get('link')
  const content_type = response.headers.get('content-type')

  if (link) {
    const { error, value: href } = linkHeaderToLinkHref(link)

    if (error) {
      return {
        error: new Error(
          `URL ${url} is served with an invalid Link header: ${error.message}`
        )
      }
    }

    return { value: canonicalUrl(href) }
  }

  // If the content type of the document is HTML, then the client MUST check for
  // an HTML <link> element with a rel value of indieauth-metadata.
  // If more than one of these is present, the first HTTP Link header takes
  // precedence, followed by the first <link> element in document order.

  if (content_type && content_type.includes('text/html')) {
    let html: string
    try {
      // We did not found a Link header, so we now try downloading the page.
      const res = await fetch(url, { method: 'GET' })
      html = await res.text()
    } catch (ex: any) {
      return { error: new Error(`Failed to fetch ${url}: ${ex.message}`) }
    }

    const { error, value: href } = htmlToLinkHref(html)

    if (error) {
      return {
        error: new Error(
          `HTML at ${url} does not contain exactly one valid <link rel="indieauth-metadata"> element: ${error.message}`
        )
      }
    }

    return { value: canonicalUrl(href) }
  }

  return {
    error: new Error(
      `URL ${url} is served with no Link header and contains no <link> element`
    )
  }
}
