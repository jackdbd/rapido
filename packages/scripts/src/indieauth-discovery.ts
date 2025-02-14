import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'
import { metadataEndpoint, serverMetadata } from '@jackdbd/indieauth'
import { exitOne } from '@repo/stdlib/test-utils'

const __filename = fileURLToPath(import.meta.url)
const prefix = `[${__filename}] `

// TIP: you can type --me giacomodebidda.com instead of writing the full URL
// because the metadataEndpoint function will canonicalize the URL

const run = async () => {
  const { values } = parseArgs({
    allowPositionals: false,
    options: {
      me: { type: 'string' }
    }
  })

  const { me } = values

  if (!me) {
    return exitOne(`${prefix}--me is required`)
  }

  // const me = 'https://aaronparecki.com/'
  // const me = 'https://paulrobertlloyd.com/'
  // const me = 'https://www.jvt.me/'
  // const me = 'https://barryfrost.com/' // no indieauth metadata endpoint
  // const me = 'https://chrisburnell.com/' // no indieauth metadata endpoint
  // const me = 'https://marksuth.dev/' // no indieauth metadata endpoint
  // const me = 'https://grant.codes/' // no indieauth metadata endpoint
  // const me = 'https://keithjgrant.com/' // no indieauth metadata endpoint
  // const me = 'https://waterpigs.co.uk/' // no indieauth metadata endpoint

  const { error, value: metadata_endpoint } = await metadataEndpoint(me)

  if (error) {
    return exitOne(`${prefix}${error.message}`)
  }

  console.log(`Metadata endpoint for ${me}: ${metadata_endpoint}`)

  const { error: metadata_error, value: metadata } =
    await serverMetadata(metadata_endpoint)

  if (metadata_error) {
    return exitOne(`${prefix}${metadata_error?.message}`)
  }

  console.log(`Server metadata for ${me}`)
  console.log(metadata)
}

run()
