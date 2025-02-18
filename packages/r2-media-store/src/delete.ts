import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3'
import type { DeleteMedia } from '@jackdbd/micropub/schemas/user-provided-functions'

export interface Config {
  bucket_name: string
  bucket_prefix: string
  s3: S3Client
}

export const defHardDeleteMedia = (config: Config) => {
  const { bucket_name, bucket_prefix, s3 } = config

  const hardDeleteMedia: DeleteMedia = async (url) => {
    // TODO: extract this to a separate function, so it can be easily tested
    const splits = url.split('/')
    const filename = splits.at(-1)!
    const bucket_path = `${bucket_prefix}${filename}`

    const params = {
      Bucket: bucket_name,
      Key: bucket_path
    }

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

    return { summary: `Deleted ${url} (hard-delete)`, details }
  }

  return hardDeleteMedia
}
