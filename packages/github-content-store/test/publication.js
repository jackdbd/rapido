import { describe, it } from 'node:test'
import { defDefaultPublication } from '../lib/index.js'

const domain = 'giacomodebidda.com'
const subdomain = 'www'
const publication = defDefaultPublication({ domain, subdomain })

describe('publication', () => {
  it('has a default location, both in the content store and on the website', (t) => {
    t.assert.ok(publication.default)

    const loc = publication.default.location
    t.assert.strictEqual(loc.store, 'default/')
    t.assert.strictEqual(loc.store_deleted, 'deleted/default/')
    t.assert.strictEqual(loc.website, `https://${subdomain}.${domain}/default/`)
  })

  it('has a location for bookmarks, both in the content store and on the website', (t) => {
    t.assert.ok(publication.items.bookmark)

    const loc = publication.items.bookmark.location
    t.assert.strictEqual(loc.store, 'bookmarks/')
    t.assert.strictEqual(loc.store_deleted, 'deleted/bookmarks/')
    t.assert.strictEqual(
      loc.website,
      `https://${subdomain}.${domain}/bookmarks/`
    )
  })

  it('has a location for likes, both in the content store and on the website', (t) => {
    t.assert.ok(publication.items.like)

    const loc = publication.items.like.location
    t.assert.strictEqual(loc.store, 'likes/')
    t.assert.strictEqual(loc.store_deleted, 'deleted/likes/')
    t.assert.strictEqual(loc.website, `https://${subdomain}.${domain}/likes/`)
  })

  it('has a location for notes, both in the content store and on the website', (t) => {
    t.assert.ok(publication.items.note)

    const loc = publication.items.note.location
    t.assert.strictEqual(loc.store, 'notes/')
    t.assert.strictEqual(loc.store_deleted, 'deleted/notes/')
    t.assert.strictEqual(loc.website, `https://${subdomain}.${domain}/notes/`)
  })
})
