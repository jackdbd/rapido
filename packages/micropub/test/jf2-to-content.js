import { describe, it } from 'node:test'
import assert from 'node:assert'
import { jf2SafeToStore, jf2ToContentWithFrontmatter } from '../lib/index.js'

describe('jf2SafeToStore', () => {
  it('removes access_token, action, h, type, mp-slug', () => {
    const input = {
      access_token: 'ey...xyz',
      action: 'create',
      content: 'Hello world',
      category: ['foo', 'bar'],
      h: 'entry',
      'mp-slug': 'hello-world',
      type: 'entry'
    }

    const output = jf2SafeToStore(input)

    assert.equal(output.content, input.content)
    assert.equal(output.category[0], input.category[0])
    assert.equal(output.category[1], input.category[1])

    assert.equal(output.access_token, undefined)
    assert.equal(output.action, undefined)
    assert.equal(output.h, undefined)
    assert.equal(output['mp-slug'], undefined)
    assert.equal(output.type, undefined)
  })
})

describe('jf2ToContentWithFrontmatter', () => {
  it('removes access_token, action, h, type, mp-slug', () => {
    const jf2 = {
      access_token: 'ey...xyz',
      action: 'create',
      content: 'Hello world',
      category: ['foo', 'bar'],
      h: 'entry',
      'mp-slug': 'hello-world',
      type: 'entry'
    }

    const str = jf2ToContentWithFrontmatter(jf2)

    assert.ok(str.includes(jf2.content))
    assert.ok(str.includes(jf2.category[0]))
    assert.ok(str.includes(jf2.category[1]))

    assert.ok(!str.includes(jf2.access_token))
    assert.ok(!str.includes(jf2.h))
    assert.ok(!str.includes(jf2['mp-slug']))
    assert.ok(!str.includes(jf2.type))
  })

  it('returns content as plain text', () => {
    const jf2 = { type: 'entry', content: 'Hello world' }

    const str = jf2ToContentWithFrontmatter(jf2)
    const lines = str.split('\n')

    assert.ok(str.includes(jf2.content))

    assert.equal(lines[0], jf2.content)
  })

  it('returns content as HTML with no frontmatter', () => {
    const jf2 = { type: 'entry', content: { html: '<p>Hello world</p>' } }

    const str = jf2ToContentWithFrontmatter(jf2)

    assert.ok(str.includes(jf2.content.html))

    assert.equal(str, jf2.content.html)
  })

  it('returns content as HTML with frontmatter', () => {
    const jf2 = {
      'bookmark-of': 'https://mxb.dev/blog/the-indieweb-for-everyone/',
      content: { html: '<p>You should read this article!</p>' }
    }

    const str = jf2ToContentWithFrontmatter(jf2)
    const lines = str.split('\n')

    assert.ok(str.includes(jf2.content.html))

    assert.equal(lines[0], '---')
    assert.equal(lines[1], `bookmark-of: ${jf2['bookmark-of']}`)
    assert.equal(lines[2], '---')
    assert.equal(lines[3], '')
    assert.equal(lines[4], jf2.content.html)
  })
})
