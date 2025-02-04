export const NAME = 'fastify-micropub-endpoint'
// export const NAME = "@jackdbd/fastify-micropub-endpoint";
import type { SyndicateToItem } from './schemas/syndicate-to.js'

export const DEFAULT = {
  INCLUDE_ERROR_DESCRIPTION: false,
  LOG_PREFIX: '[micropub-endpoint] ',
  MULTIPART_FORMDATA_MAX_FILE_SIZE: 10_000_000,
  REPORT_ALL_AJV_ERRORS: false,
  SYNDICATE_TO: [] as SyndicateToItem[]
}
