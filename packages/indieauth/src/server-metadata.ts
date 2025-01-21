import canonicalUrl from "@jackdbd/canonical-url";
import type { ServerMetadata } from "./schemas.js";

/**
 * Performs IndieAuth metadata discovery.
 *
 * IndieAuth metadata adopts OAuth 2.0 Authorization Server Metadata [RFC8414],
 * with the notable difference that discovery of the URL happens via the IndieAuth link relation rather than the
 * `.well-known` discovery method specified by RFC8414.
 *
 * @see [IndieAuth Server Metadata](https://indieauth.spec.indieweb.org/#indieauth-server-metadata)
 * @see [OAuth 2.0 Authorization Server Metadata](https://www.rfc-editor.org/rfc/rfc8414)
 */
export const serverMetadata = async (metadata_endpoint: string) => {
  const url = canonicalUrl(metadata_endpoint);

  let response: Response;
  try {
    response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
  } catch (ex: any) {
    return { error: new Error(`Failed to fetch ${url}: ${ex.message}`) };
  }

  if (!response.ok) {
    const details = `${response.statusText} (${response.status})`;
    return { error: new Error(`Failed to fetch ${url}: ${details}`) };
  }

  try {
    const metadata: ServerMetadata = await response.json();
    return { value: metadata };
  } catch (ex: any) {
    return { error: new Error(`Failed to parse JSON response: ${ex.message}`) };
  }
};
