import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'
import { describe, it } from 'node:test'
import { ASSETS_ROOT } from '@repo/stdlib'
import { mf2tTojf2, normalizeJf2 } from '../lib/index.js'
import {
  isBookmark,
  isCheckin,
  isIssue,
  isLike,
  isNote,
  isRead,
  isReply,
  isRepost,
  isRsvp
} from '../lib/jf2-predicates.js'

const mp_root = path.join(ASSETS_ROOT, 'micropub-requests')
const indiebookclub_root = path.join(mp_root, 'indiebookclub')
const jf2_spec_root = path.join(mp_root, 'jf2-spec')
const quill_root = path.join(mp_root, 'quill')

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

const note_mf2 = JSON.parse(
  fs.readFileSync(path.join(jf2_spec_root, 'note-mf2.json'), 'utf-8')
)

const note_jf2_mp_syndicate_to = JSON.parse(
  fs.readFileSync(
    path.join(quill_root, 'note-jf2-mp-syndicate-to.json'),
    'utf-8'
  )
)

describe('isBookmark', () => {
  it('is true if it has a `bookmark-of` property', () => {
    const jf2 = {
      type: 'entry',
      'bookmark-of': 'https://example.com/'
    }
    assert.ok(isBookmark(jf2))
  })
})

describe('isCheckin', () => {
  it('is true if it has a `checkin` property', () => {
    const jf2 = {
      type: 'entry',
      checkin: 'geo:41.8902,12.4922;name=Colosseum'
    }
    assert.ok(isCheckin(jf2))
  })
})

describe('isIssue', () => {
  it('is true if it has a `in-reply-to` property that is a repository hosted on GitHub', () => {
    const jf2 = {
      type: 'entry',
      'in-reply-to': 'https://github.com/jackdbd/zod-to-doc'
    }
    assert.ok(isIssue(jf2))
  })
})

describe('isLike', () => {
  it('is true if it has a `like-of` property', () => {
    const jf2 = {
      type: 'entry',
      'like-of': 'https://example.com/'
    }
    assert.ok(isLike(jf2))
  })
})

describe('isNote', () => {
  it('is true if it has type=entry and content is a string', () => {
    const jf2 = {
      type: 'entry',
      content: 'A note in plain text.'
    }
    assert.ok(isNote(jf2))
  })

  it('is true if it has `type=entry` and content is an object with html and text', () => {
    const jf2 = {
      type: 'entry',
      content: {
        html: '<p>A simple <strong>note</strong>.</p>',
        text: 'A simple note.'
      }
    }
    assert.ok(isNote(jf2))
  })

  it('is true for note-jf2-with-content-html-and-content-text.json (https://jf2.spec.indieweb.org/#simplified-json)', () => {
    assert.ok(isNote(note_jf2))
  })

  it('is false for note-mf2.json (https://jf2.spec.indieweb.org/#parsed-microformats-json)', () => {
    assert.equal(isNote(note_mf2), false)
  })

  it('is false if it has a `read-of` property', () => {
    const jf2 = {
      type: 'entry',
      content: {
        html: '<p>A simple <strong>note</strong>.</p>',
        text: 'A simple note.'
      },
      'read-of': 'https://example.com/',
      'read-status': 'to-read'
    }
    assert.ok(!isNote(jf2))
    assert.ok(isRead(jf2))
  })

  it('is false if it has a `rsvp` property', () => {
    const jf2 = {
      type: 'entry',
      content: {
        html: '<p>A simple <strong>note</strong>.</p>',
        text: 'A simple note.'
      },
      'in-reply-to': 'https://example.com/',
      rsvp: 'yes'
    }
    assert.ok(!isNote(jf2))
    assert.ok(isRsvp(jf2))
  })

  it('is true for a note that has mp-syndicate-to', () => {
    assert.ok(isNote(note_jf2_mp_syndicate_to))
  })
})

describe('isRead', () => {
  it('is true if it has a `read-of` property and `read-status=finished`', () => {
    const jf2 = {
      type: 'entry',
      'read-of': 'https://example.com/',
      'read-status': 'finished'
    }
    assert.ok(isRead(jf2))
  })

  it(`is false for a read sent by Indiebookclub if it's NOT converted to JF2`, async () => {
    assert.equal(isRead(indiebookclub_read), false)
  })

  it(`is true for a read sent by Indiebookclub if it IS converted to JF2`, async () => {
    const { error, value: jf2 } = await mf2tTojf2({
      items: [indiebookclub_read]
    })

    assert.strictEqual(error, undefined)
    assert.ok(isRead(jf2))
  })
})

describe('isReply', () => {
  it('is true if it has a `in-reply-to` property', () => {
    const jf2 = {
      type: 'entry',
      'in-reply-to': 'https://example.com/'
    }
    assert.ok(isReply(jf2))
  })

  it('is true for a reply (urlencoded converted to JF2)', () => {
    const urlencoded = {
      h: 'entry',
      content:
        '%40BarnabyWalters+My+favorite+for+that+use+case+is+Redis.+It%27s+easy+to+set+up+and+use%2C+I+often+use+it+to+move+data+between+apps+written+in+different+languages+too.',
      'in-reply-to': 'http://waterpigs.co.uk/notes/4S0LMw/',
      'mp-syndicate-to': 'https://myfavoritesocialnetwork.example/aaronpk'
    }
    const jf2 = normalizeJf2(urlencoded)

    assert.equal(isReply(urlencoded), false)
    assert.equal(isReply(jf2), true)
  })
})

describe('isRepost', () => {
  it('is true if it has a `repost-of` property', () => {
    const jf2 = {
      type: 'entry',
      'repost-of': 'https://example.com/'
    }
    assert.ok(isRepost(jf2))
  })
})

describe('isRsvp', () => {
  it('is true if it has a `in-reply-to` property and `rsvp=maybe`', () => {
    const jf2 = {
      type: 'entry',
      'in-reply-to': 'https://example.com/',
      rsvp: 'maybe'
    }
    assert.ok(isRsvp(jf2))
  })
})
