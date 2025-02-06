// import { media_endpoint } from '@jackdbd/micropub/schemas/endpoints'
import { Static, Type } from '@sinclair/typebox'
import { include_error_description, media_endpoint } from './common.js'
import { syndicate_to_item } from './syndicate-to.js'

export const micropub_get_config = Type.Object(
  {
    includeErrorDescription: include_error_description,
    mediaEndpoint: media_endpoint,
    syndicateTo: Type.Array(syndicate_to_item)
  },
  {
    additionalProperties: false,
    $id: 'micropub-endpoint-get-method-config'
  }
)

export type MicropubGetConfig = Static<typeof micropub_get_config>
