import { h_card, h_cite, h_entry, h_event } from '@jackdbd/microformats2'
// import { mp_card, mp_cite, mp_entry, mp_event } from "@jackdbd/micropub";
import type { Mf2 } from '@paulrobertlloyd/mf2tojf2'
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
    Type.Unsafe<Static<typeof h_card>>(Type.Ref(h_card.$id!)),
    Type.Unsafe<Static<typeof h_cite>>(Type.Ref(h_cite.$id!)),
    Type.Unsafe<Static<typeof h_entry>>(Type.Ref(h_entry.$id!)),
    Type.Unsafe<Static<typeof h_event>>(Type.Ref(h_event.$id!))
  ],
  {
    title: 'Micropub Request Body (JF2)',
    $id: 'micropub-endpoint-post-request-body-jf2'
  }
)

export type MicropubPostRequestBodyJF2 = Static<
  typeof micropub_post_request_body_jf2
>

// export interface PostRequestBody extends Jf2, Mf2 {}
// export interface PostRequestBody extends MicropubRequestBody, Mf2 {}
export type PostRequestBody = MicropubPostRequestBodyJF2 | Mf2

export function isMf2(body: MicropubPostRequestBodyJF2 | Mf2): body is Mf2 {
  return (body as Mf2).items !== undefined
}
