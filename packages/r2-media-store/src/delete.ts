import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3'
import type { DeleteMedia } from '@jackdbd/micropub/schemas/user-provided-functions'
import { defaultLog, type Log } from './log.js'

export interface Options {
  bucket_name: string // allow configuring this with an environment variable?
  bucket_prefix: string // allow configuring this with an environment variable?
  log?: Log
  s3: S3Client
}

const defaults: Partial<Options> = {
  log: defaultLog
}

export const defHardDeleteMedia = (options?: Options) => {
  const config = Object.assign({}, defaults, options) as Required<Options>

  const { bucket_name, bucket_prefix, log, s3 } = config

  const hardDeleteMedia: DeleteMedia = async (url) => {
    // TODO: extract this to a separate function, so it can be easily tested
    const splits = url.split('/')
    const filename = splits.at(-1)!
    const bucket_path = `${bucket_prefix}${filename}`

    const params = {
      Bucket: bucket_name,
      Key: bucket_path
    }

    log.debug(
      `deleting ${filename} from bucket ${bucket_name} at ${bucket_path}`
    )

    // TODO: how do we know if the operation succeeded? From output.$metadata?
    const output = await s3.send(new DeleteObjectCommand(params))
    // The output is the same, whether the object existed and was deleted, or
    // if it didn't exist in the first place.

    // const { VersionId: version_id, $metadata: meta } = output;
    // const status_code = meta.httpStatusCode || 204;
    // const status_text = status_code === 204 ? "No Content" : "Success";
    const { VersionId: version_id } = output

    const details: string[] = []
    if (version_id) {
      details.push(
        `The file that was hosted on Cloudflare R2 bucket ${bucket_name} at ${bucket_path} (Version ID: ${version_id}) is no longer available at ${url}.`
      )
    } else {
      details.push(
        `The file that was hosted on Cloudflare R2 bucket ${bucket_name} at ${bucket_path} is no longer available at ${url}.`
      )
    }

    const summary = `Deleted ${url} (hard-delete)`
    log.debug(summary)
    details.forEach(log.debug)
    return { summary, details }
  }

  return hardDeleteMedia
}
