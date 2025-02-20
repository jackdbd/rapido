import { Type } from '@sinclair/typebox'

/**
 * Time with optional seconds or milliseconds.
 *
 * @see [Ajv Formats](https://ajv.js.org/packages/ajv-formats.html#formats)
 */
export const time = Type.String({
  format: 'iso-time',
  title: 'Time (ISO)',
  description:
    'Represents a time in the format "HH:MM:SS.sssZ", optionally without seconds or milliseconds.'
})

/**
 * Date-time formatted according to ISO 8601.
 *
 * Corresponds to what you get from `new Date().toISOString()`
 *
 * @see [Ajv Formats](https://ajv.js.org/packages/ajv-formats.html#formats)
 * @see [ISO 8601 - microformats.org](https://microformats.org/wiki/iso-8601)
 * @see [ISO 8601 - wikipedia.org](https://en.wikipedia.org/wiki/ISO_8601)
 */
export const date_time = Type.String({
  format: 'iso-date-time',
  title: 'Full date-time string (ISO 8601)',
  description:
    'Represents a full date-time string in the ISO 8601 format (time zone is optional).'
})
