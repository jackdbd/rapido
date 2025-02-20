import { type Static, Type } from '@sinclair/typebox'

/**
 * @see [video - indieweb.org](https://indieweb.org/video)
 */
export const u_video = Type.String({
  $id: 'u-video',
  title: 'Video',
  description: 'URL of a video file.',
  format: 'uri'
})

/**
 * @see [video - indieweb.org](https://indieweb.org/video)
 */
export type U_Video = Static<typeof u_video>
