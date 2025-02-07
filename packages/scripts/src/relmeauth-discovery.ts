import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'
import canonicalUrl from '@jackdbd/canonical-url'
import { relMeHrefs } from '@jackdbd/relmeauth'
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

  const me = canonicalUrl(me_given)

  const { error, value: hrefs } = await relMeHrefs(me)

  if (error) {
    console.error(error)
    process.exit(1)
  }

  console.log(`rel="me" links found at URL ${me}`)
  console.log(hrefs)
}

run()
