import { describe, it } from 'node:test'
import { defText } from '../lib/index.js'

// https://loremipsum.io/generator?n=1&t=p
const lorem_ipsum_1_paragraph = `Lorem ipsum odor amet, consectetuer adipiscing elit. Libero per mi ut rutrum nec dui mi primis. Aptent dolor posuere litora himenaeos nostra cursus integer nec. Curabitur consectetur sociosqu luctus congue per. Consequat curae quis eu auctor libero risus maecenas malesuada erat. Tortor purus gravida blandit finibus lacus sodales, sem molestie eget. Donec potenti molestie vitae tellus in tellus vehicula dignissim. Turpis netus ridiculus odio inceptos facilisi molestie sed lectus aliquam. Adipiscing nunc class accumsan at nullam vitae nullam.`

describe('defText', () => {
  describe('output', () => {
    it('contains the text content, and the canonical URL we syndicated from', (t) => {
      const canonicalUrl = 'https://example.com/'

      const text = defText({
        canonicalUrl,
        jf2: { type: 'entry', content: lorem_ipsum_1_paragraph }
      })

      t.assert.ok(text.includes(lorem_ipsum_1_paragraph))
      t.assert.ok(text.includes(canonicalUrl))
    })
  })
})
