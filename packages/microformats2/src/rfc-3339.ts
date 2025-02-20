import { Type } from '@sinclair/typebox'

/**
 * Full-date according to RFC 3339.
 *
 * @see [Internet Date/Time Format - Date and Time on the Internet: Timestamps (RFC 3339)](https://datatracker.ietf.org/doc/html/rfc3339#section-5.6)
 * @see [Ajv Formats](https://ajv.js.org/packages/ajv-formats.html#formats)
 */
export const date = Type.String({
  format: 'date',
  title: 'Date (RFC 3339)',
  description: 'Date formatted according to RFC 3339.'
})

/**
 * Date-time formatted according to RFC 3339 (time-zone is mandatory).
 *
 * @see [Internet Date/Time Format - Date and Time on the Internet: Timestamps (RFC 3339)](https://datatracker.ietf.org/doc/html/rfc3339#section-5.6)
 * @see [Ajv Formats](https://ajv.js.org/packages/ajv-formats.html#formats)
 */
export const date_time = Type.String({
  format: 'date-time',
  title: 'Date with time zone (RFC 3339)',
  description:
    'Date-time formatted according to RFC 3339 (time-zone is mandatory).'
})
