import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'
import { clientMetadata } from '@jackdbd/indieauth'
import { exitOne } from '@repo/stdlib'

const __filename = fileURLToPath(import.meta.url)
const prefix = `[${__filename}] `

// TIP: you can type --client-id sparkles.sploot.com instead of writing the full
// URL because the clientMetadata function will canonicalize the URL

const run = async () => {
  const { values } = parseArgs({
    allowPositionals: false,
    options: {
      'client-id': { type: 'string' },
      debug: { type: 'boolean' },
      'require-microformat-app': { type: 'boolean' }
    }
  })

  const {
    'client-id': client_id,
    debug,
    'require-microformat-app': requireMicroformatApp
  } = values

  // These applications host their client metadata as a JSON document.
  // const client_id = 'https://indiebookclub.biz/id'
  // const client_id = 'https://indielogin.com/id'
  // const client_id = 'https://webmention.io/id'

  // This application has its client metadata within the HTML document.
  // const client_id = 'https://quill.p3k.io/'

  // This application does not define redirect_uris, so I don't think we can
  // obtain all the client metadata we need.
  // const client_id = 'https://sparkles.sploot.com/'

  // This application does not have the h-x-app microformat class. Also, it does
  // not seem to define redirect_uris and logo_uri.
  // const client_id = 'https://micropublish.net/'

  if (!client_id) {
    return exitOne(`${prefix}--client-id is required`)
  }

  const { error, value: metadata } = await clientMetadata(client_id, {
    debug,
    requireMicroformatApp
  })

  if (error) {
    return exitOne(`${prefix}${error?.message}`)
  }

  console.log(`Client metadata for ${client_id}`)
  console.log(metadata)
}

run()
