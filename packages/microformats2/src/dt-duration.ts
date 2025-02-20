import { Static, Type } from '@sinclair/typebox'

/**
 * Duration, formatted according to RFC 3339 (to use in u-audio, u-video).
 *
 * @see [duration - indieweb.org](https://indieweb.org/duration)
 * @see [Appendix A. ISO 8601 Collected ABNF - Date and Time on the Internet: Timestamps (RFC 3339)](https://datatracker.ietf.org/doc/html/rfc3339#appendix-A)
 * @see [Ajv Formats](https://ajv.js.org/packages/ajv-formats.html#formats)
 */
export const dt_duration = Type.String({
  $id: 'dt-duration',
  title: 'Duration',
  description:
    'Duration, formatted according to RFC 3339 (to use in u-audio, u-video).',
  format: 'duration'
})

export type DT_Duration = Static<typeof dt_duration>
