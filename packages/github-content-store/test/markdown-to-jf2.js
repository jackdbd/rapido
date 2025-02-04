import { describe, it } from 'node:test'
import { markdownToJf2 } from '../lib/index.js'

describe('markdownToJf2', () => {
  it('parses the frontmatter correctly', (t) => {
    const bookmark_of = 'https://mxb.dev/blog/the-indieweb-for-everyone/'
    const lines = [
      '---',
      `bookmark-of: ${bookmark_of}`,
      `category:`,
      '- awesome',
      '- indieweb',
      '---',
      '',
      'Hello **world**'
    ]
    const md = lines.join('\n')

    const jf2 = markdownToJf2(md)

    t.assert.equal(jf2.content.text, 'Hello world')
    t.assert.equal(jf2.content.html, '<p>Hello <strong>world</strong></p>')
    t.assert.ok(jf2.category.includes('awesome'))
    t.assert.ok(jf2.category.includes('indieweb'))
  })
})
