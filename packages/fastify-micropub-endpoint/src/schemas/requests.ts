import type { MF2, ParsedMF2 } from '@jackdbd/microformats2'
import { card, cite, entry, event } from '@jackdbd/micropub'
import { Static, Type } from '@sinclair/typebox'

// https://micropub.spec.indieweb.org/#querying
export const micropub_get_request_querystring = Type.Object(
  {
    // q: Type.String({ minLength: 1 }),
    q: Type.Literal('config')
    // TODO: "config" is not the only possible value for "q". See other values here:
    // https://micropub.spec.indieweb.org/#source-content
  },
  {
    title: 'Micropub Request Querystring',
    $id: 'micropub-endpoint-get-request-querystring'
  }
)

export type MicropubGetRequestQuerystring = Static<
  typeof micropub_get_request_querystring
>

export const micropub_post_request_body_jf2 = Type.Union(
  [
    Type.Unsafe<Static<typeof card>>(Type.Ref(card.$id!)),
    Type.Unsafe<Static<typeof cite>>(Type.Ref(cite.$id!)),
    Type.Unsafe<Static<typeof entry>>(Type.Ref(entry.$id!)),
    Type.Unsafe<Static<typeof event>>(Type.Ref(event.$id!))
  ],
  {
    title: 'Micropub Request Body (JF2)',
    $id: 'micropub-endpoint-post-request-body-jf2'
  }
)

export type MicropubPostRequestBodyJF2 = Static<
  typeof micropub_post_request_body_jf2
>

export type PostRequestBody = MicropubPostRequestBodyJF2 | MF2 | ParsedMF2
