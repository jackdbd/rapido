import { type Static, Type } from '@sinclair/typebox'

/**
 * @see [audio - indieweb.org](https://indieweb.org/audio)
 */
export const u_audio = Type.String({
  $id: 'u-audio',
  title: 'Audio',
  description: 'URL of an audio file.',
  format: 'uri'
})

/**
 * @see [audio - indieweb.org](https://indieweb.org/audio)
 */
export type U_Audio = Static<typeof u_audio>
