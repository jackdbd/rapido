import { Static, Type } from '@sinclair/typebox'
import * as iso8601 from './iso-8601.js'
import * as rfc3339 from './rfc-3339.js'

/**
 * The format of `published` and `updated` fields may change from [ISO 8601] to
 * [RFC 3339] or use [microformats2]'s more liberal `date` field.
 *
 * @see [Date Design Pattern - microformats.org](https://microformats.org/wiki/date-design-pattern)
 * @see [datetime - indieweb.org](https://indieweb.org/datetime)
 * @see [time - indieweb.org](https://indieweb.org/time)
 * @see [timezone - indieweb.org](https://indieweb.org/timezone)
 * @see [ISO 8601 - microformats.org](https://microformats.org/wiki/iso-8601)
 * @see [ISO 8601 - wikipedia.org](https://en.wikipedia.org/wiki/ISO_8601)
 */
export const date = Type.Union(
  [rfc3339.date, rfc3339.date_time, iso8601.date_time],
  {
    title: 'Date',
    description: 'Date formatted according to ISO 8601 or RFC 3339.'
  }
)

export type Date = Static<typeof date>
