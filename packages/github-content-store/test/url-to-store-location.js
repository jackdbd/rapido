import { describe, it } from 'node:test'
import { defDefaultPublication, defUrlToLocation } from '../lib/index.js'

const domain = 'giacomodebidda.com'
const subdomain = 'www'
const publication = defDefaultPublication({ domain, subdomain })

const urlToLocation = defUrlToLocation({ publication })

describe('urlToLocation', () => {
  it('maps the URL of a bookmark published on a website, to the location of that bookmark in the content store', (t) => {
    const url =
      'https://www.giacomodebidda.com/bookmarks/inline-caches-in-javascript-engines/'

    const loc = urlToLocation(url)

    t.assert.strictEqual(
      loc.store,
      'bookmarks/inline-caches-in-javascript-engines.md'
    )
    t.assert.strictEqual(
      loc.store_deleted,
      'deleted/bookmarks/inline-caches-in-javascript-engines.md'
    )
    t.assert.strictEqual(loc.website, url)
  })

  it('maps the URL of a note published on a website, to the location of that note in the content store', (t) => {
    const url = 'https://www.giacomodebidda.com/notes/test-note-multimedia/'

    const loc = urlToLocation(url)

    t.assert.strictEqual(loc.store, 'notes/test-note-multimedia.md')
    t.assert.strictEqual(
      loc.store_deleted,
      'deleted/notes/test-note-multimedia.md'
    )
    t.assert.strictEqual(loc.website, url)
  })
})
