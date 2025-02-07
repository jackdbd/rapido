import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'
import canonicalUrl from '@jackdbd/canonical-url'
import { metadataEndpoint, serverMetadata } from '@jackdbd/indieauth'
import { ME } from '../../stdlib/lib/test-utils.js'

const __filename = fileURLToPath(import.meta.url)
const prefix = `[${__filename}] `

const run = async () => {
  const { values } = parseArgs({
    allowPositionals: false,
    options: {
      me: { type: 'string', default: ME },
      verbose: { type: 'boolean' }
    }
  })

  const { me: me_given, verbose } = values

  if (verbose) {
    console.log(`${prefix}ensuring given profile URL is a canonical URL`)
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

  const me = canonicalUrl(me_given)

  const { error, value: metadata_endpoint } = await metadataEndpoint(me)

  if (error) {
    console.error(error)
    process.exit(1)
  }

  console.log(`Metadata endpoint for ${me}: ${metadata_endpoint}`)

  const { error: metadata_error, value: metadata } =
    await serverMetadata(metadata_endpoint)

  if (metadata_error) {
    console.error(metadata_error)
    process.exit(1)
  }

  console.log(`Server metadata for ${me}`)
  console.log(metadata)
}

run()
