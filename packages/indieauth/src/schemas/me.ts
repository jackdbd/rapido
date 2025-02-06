import { Type } from '@sinclair/typebox'

/**
 * The `me` parameter. It might not be a canonical URL.
 */
export const me_before_url_canonicalization = Type.String({
  description: `Profile URL (before URL Canonicalization)`,
  minLength: 1,
  title: 'me (not canonicalized)'
})

/**
 * Profile URL (after [URL Canonicalization](https://indieauth.spec.indieweb.org/#url-canonicalization)).
 */
export const me_after_url_canonicalization = Type.String({
  description: `Profile URL (after URL Canonicalization)`,
  format: 'uri',
  title: 'me (canonicalized)'
})
