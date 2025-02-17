import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'
import { describe, it } from 'node:test'
import { nanoid } from 'nanoid'
import { ASSETS_ROOT } from '@repo/stdlib'
import { jf2_predicates, jf2ToSlug, mf2tTojf2 } from '../lib/index.js'

const { isBookmark, isLike, isNote, isRead, isRepost, isRsvp } = jf2_predicates

const mp_root = path.join(ASSETS_ROOT, 'micropub-requests')
const indiebookclub_root = path.join(mp_root, 'indiebookclub')
const jf2_spec_root = path.join(mp_root, 'jf2-spec')

const indiebookclub_read = JSON.parse(
  fs.readFileSync(path.join(indiebookclub_root, 'read.json'), 'utf-8')
)

const note_jf2 = JSON.parse(
  fs.readFileSync(
    path.join(
      jf2_spec_root,
      'note-jf2-with-content-html-and-content-text.json'
    ),
    'utf-8'
  )
)

describe('jf2ToSlug', () => {
  it('throws when trying to generate a slug of `undefined`', (t) => {
    t.assert.throws(
      () => {
        jf2ToSlug(undefined)
      },
      { message: /cannot generate slug/ }
    )
  })

  it('throws when trying to generate a slug of an empty JF2 entry', (t) => {
    t.assert.throws(
      () => {
        // This is valid JF2. Actually, even `type` would not be required.
        jf2ToSlug({ type: 'entry' })
      },
      {
        message:
          /object has none of these properties that could be used to generate a slug/
      }
    )
  })

  it('uses `content` in a plain text note', () => {
    const jf2 = {
      type: 'entry',
      content: 'A plain text note.'
    }
    assert.ok(isNote(jf2))

    const slug = jf2ToSlug(jf2)

    assert.strictEqual(slug, 'a-plain-text-note')
  })

  it('uses `name` in a note that has the `name` property', () => {
    const name = nanoid()
    const jf2 = {
      type: 'entry',
      name,
      summary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      content: {
        html: '<p>Donec dapibus enim lacus, <i>a vehicula magna bibendum non</i>. Phasellus id lacinia felis, vitae pellentesque enim. Sed at quam dui. Suspendisse accumsan, est id pulvinar consequat, urna ex tincidunt enim, nec sodales lectus nulla et augue. Cras venenatis vehicula molestie. Donec sagittis elit orci, sit amet egestas ex pharetra in.</p>',
        text: 'Donec dapibus enim lacus, a vehicula magna bibendum non. Phasellus id lacinia felis, vitae pellentesque enim. Sed at quam dui. Suspendisse accumsan, est id pulvinar consequat, urna ex tincidunt enim, nec sodales lectus nulla et augue. Cras venenatis vehicula molestie. Donec sagittis elit orci, sit amet egestas ex pharetra in.'
      }
    }

    assert.ok(isNote(jf2))

    const slug = jf2ToSlug(jf2)

    assert.strictEqual(slug, name.toLowerCase())
  })

  it('uses `bookmark-of` in a bookmark', () => {
    const jf2 = {
      type: 'entry',
      'bookmark-of': 'http://example.com/articles/xyz/'
    }
    assert.ok(isBookmark(jf2))

    const slug = jf2ToSlug(jf2)

    assert.strictEqual(slug, 'example-com-articles-xyz')
  })

  it('uses `bookmark-of` and removes `www.` in a bookmark', () => {
    const jf2 = {
      type: 'entry',
      'bookmark-of': 'http://www.example.com/articles/xyz/'
    }
    assert.ok(isBookmark(jf2))

    const slug = jf2ToSlug(jf2)

    assert.strictEqual(slug, 'example-com-articles-xyz')
  })

  it('uses `like-of` in a like', () => {
    const jf2 = {
      type: 'entry',
      'like-of': 'http://example.com/articles/xyz/'
    }
    assert.ok(isLike(jf2))

    const slug = jf2ToSlug(jf2)

    assert.strictEqual(slug, 'example-com-articles-xyz')
  })

  it('uses `like-of` and removes `www.` in a like', () => {
    const jf2 = {
      type: 'entry',
      'like-of': 'http://www.example.com/articles/xyz/'
    }
    assert.ok(isLike(jf2))

    const slug = jf2ToSlug(jf2)

    assert.strictEqual(slug, 'example-com-articles-xyz')
  })

  it('uses `in-reply-to` in a RSVP', () => {
    const jf2 = {
      type: 'entry',
      'in-reply-to': 'http://example.com/events/xyz/',
      content: 'Awesome party.',
      rsvp: 'interested'
    }
    assert.ok(isRsvp(jf2))

    const slug = jf2ToSlug(jf2)

    assert.strictEqual(slug, 'example-com-events-xyz')
  })

  it('uses `in-reply-to` and removes `www.` in a RSVP', () => {
    const jf2 = {
      type: 'entry',
      'in-reply-to': 'http://www.example.com/events/xyz/',
      content: 'Awesome party.',
      rsvp: 'interested'
    }
    assert.ok(isRsvp(jf2))

    const slug = jf2ToSlug(jf2)

    assert.strictEqual(slug, 'example-com-events-xyz')
  })

  it('uses `summary` in a read', async () => {
    const { error, value: jf2 } = await mf2tTojf2({
      items: [indiebookclub_read]
    })
    assert.strictEqual(error, undefined)
    assert.ok(isRead(jf2))

    const slug = jf2ToSlug(jf2)
    assert.strictEqual(
      slug,
      'currently-reading-the-wealth-of-nations-by-adam-smith'
    )
  })

  it('uses `repost-of` in a repost', () => {
    const jf2 = {
      type: 'entry',
      'repost-of': 'http://example.com/articles/xyz/'
    }
    assert.ok(isRepost(jf2))

    const slug = jf2ToSlug(jf2)

    assert.strictEqual(slug, 'example-com-articles-xyz')
  })

  it('uses `repost-of` and removes `www.` in a repost', () => {
    const jf2 = {
      type: 'entry',
      'repost-of': 'http://www.example.com/articles/xyz/'
    }
    assert.ok(isRepost(jf2))

    const slug = jf2ToSlug(jf2)

    assert.strictEqual(slug, 'example-com-articles-xyz')
  })
})
