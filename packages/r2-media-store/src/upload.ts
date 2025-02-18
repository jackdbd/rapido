import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import type { UploadMedia } from '@jackdbd/micropub/schemas/user-provided-functions'
import mime from 'mime'
import { nanoid } from 'nanoid'
import { defaultLog, type Log } from './log.js'

export interface Options {
  bucket_name: string
  bucket_prefix: string
  ignore_filename: boolean
  log?: Log
  public_base_url: string
  s3: S3Client
}

const defaults: Partial<Options> = {
  log: defaultLog
}

export const defUpload = (options?: Options) => {
  const config = Object.assign({}, defaults, options) as Required<Options>

  const {
    bucket_name,
    bucket_prefix,
    ignore_filename,
    log,
    public_base_url,
    s3
  } = config

  const upload: UploadMedia = async (cfg) => {
    const { body: Body, contentType: ContentType } = cfg

    // TODO: extract this to a separate function, so it can be easily tested
    const filename = ignore_filename
      ? `${nanoid()}.${mime.getExtension(ContentType)}`
      : cfg.filename

    const bucket_path = `${bucket_prefix}${filename}`
    const public_url = `${public_base_url}${bucket_prefix}${filename}`

    const params = {
      Bucket: bucket_name,
      Key: bucket_path,
      Body,
      ContentType
    }

    log.debug(
      `uploading ${filename} (ContentType: ${ContentType}) to bucket ${bucket_name} at ${bucket_path}`
    )

    // TODO: how do we know if the operation succeeded? From output.$metadata?
    const output = await s3.send(new PutObjectCommand(params))
    console.log('=== s3.send PutObjectCommand return value ===', output)

    const { ETag: etag, VersionId: version_id, $metadata: meta } = output
    console.log('=== s3.send output metadata ===', meta)
    // const status_code = meta.httpStatusCode || 200;
    // const status_text = status_code === 201 ? "Created" : "Success";
    const summary = `File ${filename} is now hosted at ${public_url}.`
    const details = [
      `File ${ContentType} uploaded to Cloudflare R2 bucket ${bucket_name} at ${bucket_path} and publicly available at ${public_url} (ETag: ${etag}, Version ID: ${version_id})`
    ]

    log.debug(summary)
    details.forEach(log.debug)
    return { url: public_url, summary, details }
  }

  return upload
}
