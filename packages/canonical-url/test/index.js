import { describe, it } from 'node:test'
import canonicalUrl from '../lib/index.js'

describe('canonicalUrl', () => {
  it('adds a trailing slash', (t) => {
    // If a URL with no path component is ever encountered, it MUST be treated
    // as if it had the path /
    // https://indieauth.spec.indieweb.org/#url-canonicalization-p-1
    const url = canonicalUrl('https://example.com')
    t.assert.strictEqual(url, 'https://example.com/')
  })

  it('adds a path to a base URL', (t) => {
    const url = canonicalUrl('some-path', 'https://website.example')
    t.assert.strictEqual(url, 'https://website.example/some-path')
  })

  it('ignores the base URL if the path is already a URL by itself', (t) => {
    const url = canonicalUrl(
      'https://website.example/some-path',
      'https://website.example'
    )
    t.assert.strictEqual(url, 'https://website.example/some-path')
  })

  it('can handle a URL that has http://localhost and no path', (t) => {
    const url = canonicalUrl('http://localhost:3000')
    t.assert.strictEqual(url, 'http://localhost:3000/')
  })

  it('can handle a URL that has http://localhost and a path', (t) => {
    const url = canonicalUrl('foo', 'http://localhost:3000')
    t.assert.strictEqual(url, 'http://localhost:3000/foo')
  })
})
