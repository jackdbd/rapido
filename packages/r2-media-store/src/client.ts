import { S3Client } from '@aws-sdk/client-s3'
import { defHardDeleteMedia } from './delete.js'
import { defUpload } from './upload.js'

export interface Credentials {
  accessKeyId: string
  secretAccessKey: string
}

export interface Config {
  /**
   * You Cloudflare account ID.
   */
  account_id: string

  /**
   * The name of your Cloudflare R2 bucket.
   */
  bucket_name: string

  /**
   * The base path on the bucket where you want to upload files to (e.g. media/).
   */
  bucket_prefix?: string

  credentials: Credentials

  ignore_filename?: boolean

  /**
   * The base URL at which your files will be publicly accessible.
   *
   * @see https://developers.cloudflare.com/r2/buckets/public-buckets/
   */
  public_base_url: string
}

const defaults: Partial<Config> = {
  bucket_prefix: 'media/',
  ignore_filename: false
}

/**
 * Allows to upload files to a Cloudflare R2 bucket (R2 implements the S3 API).
 *
 * @see [S3 API compatibility](https://developers.cloudflare.com/r2/api/s3/api/)
 */
export const defR2 = (config: Config) => {
  const store_cfg = Object.assign({}, defaults, config) as Required<Config>

  const {
    account_id,
    bucket_name,
    bucket_prefix,
    credentials,
    ignore_filename
  } = store_cfg

  const public_base_url = store_cfg.public_base_url.endsWith('/')
    ? store_cfg.public_base_url
    : `${store_cfg.public_base_url}/`

  const region = 'auto'
  const endpoint = `https://${account_id}.r2.cloudflarestorage.com`

  const store_name = `Cloudflare R2 bucket ${bucket_name} (region ${region})`

  const info = {
    account_id,
    name: store_name,
    bucket_name,
    bucket_prefix,
    endpoint,
    ignore_filename,
    public_base_url
  }

  const s3 = new S3Client({ region, endpoint, credentials })

  return {
    delete: defHardDeleteMedia({ bucket_name, bucket_prefix, s3 }),
    info,
    upload: defUpload({
      bucket_name,
      bucket_prefix,
      ignore_filename,
      public_base_url,
      s3
    })
  }
}
