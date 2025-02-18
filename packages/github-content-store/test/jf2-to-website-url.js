import fs from 'node:fs'
import path from 'node:path'
import { describe, it } from 'node:test'
import { mf2tTojf2, jf2ToSlug, normalizeJf2 } from '@jackdbd/micropub'
import * as jf2_predicate from '@jackdbd/micropub/jf2-predicates'
import * as url_predicate from '@jackdbd/micropub/url-predicates'
import { ASSETS_ROOT } from '@repo/stdlib'
import {
  defPublication,
  defDefaultPublication,
  defJf2ToWebsiteUrl
} from '../lib/index.js'

const mp_root = path.join(ASSETS_ROOT, 'micropub-requests')
const indiebookclub_root = path.join(mp_root, 'indiebookclub')
const jf2_spec_root = path.join(mp_root, 'jf2-spec')
const quill_root = path.join(mp_root, 'quill')
const domain = 'giacomodebidda.com'
const subdomain = 'www'
const base_url = `https://${subdomain}.${domain}`

// const empty_publication = defPublication({ domain, subdomain })

const default_publication = defDefaultPublication({ domain, subdomain })

const cards_and_cites_publication = defPublication({
  domain,
  subdomain,
  items: {
    card: {
      predicate: { store: jf2_predicate.isCard, website: url_predicate.isCard },
      location: {
        store: `cards/`,
        store_deleted: 'deleted/cards/',
        website: `${base_url}/cards/`
      }
    },
    cite: {
      predicate: { store: jf2_predicate.isCite, website: url_predicate.isCite },
      location: {
        store: `quotes/`,
        store_deleted: 'deleted/quotes/',
        website: `${base_url}/quotes/`
      }
    }
  }
})

const jf2ToWebsiteUrl = defJf2ToWebsiteUrl({
  // log: console,
  name: 'Fake store',
  publication: default_publication
})

const jf2CardToWebsiteUrl = defJf2ToWebsiteUrl({
  // log: console,
  name: 'Fake cards store',
  publication: cards_and_cites_publication
})

const jf2CiteToWebsiteUrl = defJf2ToWebsiteUrl({
  // log: console,
  name: 'Fake cites store',
  publication: cards_and_cites_publication
})

const jf2EventToWebsiteUrl = defJf2ToWebsiteUrl({
  // log: console,
  name: 'Fake events store',
  publication: default_publication
})

const indiebookclub_read = JSON.parse(
  fs.readFileSync(path.join(indiebookclub_root, 'read.json'), 'utf-8')
)

const note_mf2 = JSON.parse(
  fs.readFileSync(path.join(jf2_spec_root, 'note-mf2.json'), 'utf-8')
)

const note_mf2_json = JSON.parse(
  fs.readFileSync(path.join(jf2_spec_root, 'note-mf2-json.json'), 'utf-8')
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

const reply_urlencoded_mp_syndicate_to = JSON.parse(
  fs.readFileSync(
    path.join(quill_root, 'reply-urlencoded-mp-syndicate-to.json'),
    'utf-8'
  )
)

describe('jf2ToWebsiteURL (card)', () => {
  it('maps a card to the expected URL', (t) => {
    const jf2 = {
      type: 'card',
      name: 'Isaac Newton'
    }

    const slug = jf2ToSlug(jf2)

    t.assert.strictEqual(
      jf2CardToWebsiteUrl(jf2),
      `https://${subdomain}.${domain}/cards/${slug}/`
    )
  })

  it('generates a URL containing mp-slug, when provided', (t) => {
    const mp_slug = 'test-card'
    const jf2 = {
      type: 'card',
      name: 'Isaac Newton',
      'mp-slug': mp_slug
    }

    const slug = jf2ToSlug(jf2)

    t.assert.strictEqual(slug, mp_slug)
    t.assert.strictEqual(
      jf2CiteToWebsiteUrl(jf2),
      `https://${subdomain}.${domain}/cards/${slug}/`
    )
  })
})

describe('jf2ToWebsiteURL (cite/quote)', () => {
  it('maps a cite to the expected URL', (t) => {
    const jf2 = {
      type: 'cite',
      name: 'The Correspondence of Isaac Newton: Volume 5',
      author: 'Isaac Newton',
      content:
        'If I have seen further it is by standing on the shoulders of Giants.'
    }

    const slug = jf2ToSlug(jf2)

    t.assert.strictEqual(
      jf2CiteToWebsiteUrl(jf2),
      `https://${subdomain}.${domain}/quotes/${slug}/`
    )
  })

  it('generates a URL containing mp-slug, when provided', (t) => {
    const mp_slug = 'test-cite'
    const jf2 = {
      type: 'cite',
      name: 'The Correspondence of Isaac Newton: Volume 5',
      author: 'Isaac Newton',
      content:
        'If I have seen further it is by standing on the shoulders of Giants.',
      'mp-slug': mp_slug
    }

    const slug = jf2ToSlug(jf2)

    t.assert.strictEqual(slug, mp_slug)
    t.assert.strictEqual(
      jf2CiteToWebsiteUrl(jf2),
      `https://${subdomain}.${domain}/quotes/${slug}/`
    )
  })
})

describe('jf2ToWebsiteURL (event)', () => {
  it('maps an event to the expected URL', (t) => {
    const jf2 = {
      type: 'event',
      category: ['bruno', 'test'],
      content: {
        html: '<p>My <strong>test</strong> event</p>',
        text: 'My test event'
      },
      photo: {
        alt: 'View of El Médano in Tenerife. A few kitesurfers are in the water. A few other ones are on the beach, preparing their kites.',
        value:
          'https://content.giacomodebidda.com/media/photos/2024/10/18/el-medano-tenerife-2023.jpg'
      }
    }

    const slug = jf2ToSlug(jf2)

    t.assert.strictEqual(
      jf2EventToWebsiteUrl(jf2),
      `https://${subdomain}.${domain}/events/${slug}/`
    )
  })

  it('generates a URL containing mp-slug, when provided', (t) => {
    const mp_slug = 'test-event'

    const jf2 = {
      type: 'event',
      category: ['bruno', 'test'],
      content: {
        html: '<p>My <strong>test</strong> event</p>',
        text: 'My test event'
      },
      'mp-slug': mp_slug,
      photo: {
        alt: 'View of El Médano in Tenerife. A few kitesurfers are in the water. A few other ones are on the beach, preparing their kites.',
        value:
          'https://content.giacomodebidda.com/media/photos/2024/10/18/el-medano-tenerife-2023.jpg'
      }
    }

    const slug = jf2ToSlug(jf2)

    t.assert.strictEqual(slug, mp_slug)
    t.assert.strictEqual(
      jf2EventToWebsiteUrl(jf2),
      `https://${subdomain}.${domain}/events/${slug}/`
    )
  })
})

describe('jf2ToWebsiteURL (entry)', () => {
  it('maps a bookmark to the expected URL', (t) => {
    const jf2 = {
      type: 'entry',
      'bookmark-of': 'https://piccalil.li/blog/what-are-design-tokens/',
      content: `Andy Bell's article on design tokens`
    }

    const slug = jf2ToSlug(jf2)

    t.assert.strictEqual(
      jf2ToWebsiteUrl(jf2),
      `https://${subdomain}.${domain}/bookmarks/${slug}/`
    )
  })

  it('generates a URL containing mp-slug, when provided (bookmark-of)', (t) => {
    const jf2 = {
      type: 'entry',
      'bookmark-of': 'https://piccalil.li/blog/what-are-design-tokens/',
      content: `Andy Bell's article on design tokens`,
      'mp-slug': 'design-tokens-article'
    }

    const slug = jf2ToSlug(jf2)

    t.assert.strictEqual(jf2['mp-slug'], slug)
    t.assert.strictEqual(
      jf2ToWebsiteUrl(jf2),
      `https://${subdomain}.${domain}/bookmarks/${slug}/`
    )
  })

  it('maps a like to the expected URL', (t) => {
    const jf2 = {
      type: 'entry',
      'like-of': 'https://mxb.dev/blog/make-free-stuff/'
    }

    const slug = jf2ToSlug(jf2)

    t.assert.strictEqual(
      jf2ToWebsiteUrl(jf2),
      `https://${subdomain}.${domain}/likes/${slug}/`
    )
  })

  it('generates a URL containing mp-slug, when provided (like-of)', (t) => {
    const jf2 = {
      type: 'entry',
      'like-of': 'https://mxb.dev/blog/make-free-stuff/',
      content: `Max Böck article about freedom of content`,
      'mp-slug': 'max-free-content'
    }

    const slug = jf2ToSlug(jf2)

    t.assert.strictEqual(jf2['mp-slug'], slug)
    t.assert.strictEqual(
      jf2ToWebsiteUrl(jf2),
      `https://${subdomain}.${domain}/likes/${slug}/`
    )
  })

  it('maps a note to the expected URL (MF2)', async (t) => {
    const { error, value: jf2 } = await mf2tTojf2(note_mf2)

    t.assert.strictEqual(error, undefined)
    const slug = jf2ToSlug(jf2)

    t.assert.strictEqual(
      jf2ToWebsiteUrl(jf2),
      `https://${subdomain}.${domain}/notes/${slug}/`
    )
  })

  it('maps a note to the expected URL (MF2 JSON)', async (t) => {
    const { error, value: jf2 } = await mf2tTojf2({ items: [note_mf2_json] })

    t.assert.strictEqual(error, undefined)
    const slug = jf2ToSlug(jf2)

    t.assert.strictEqual(
      jf2ToWebsiteUrl(jf2),
      `https://${subdomain}.${domain}/notes/${slug}/`
    )
  })

  it('maps a note to the expected URL (JF2, content is string)', (t) => {
    const jf2 = {
      type: 'entry',
      content: 'The most minimal note ever.'
    }

    const slug = jf2ToSlug(jf2)

    t.assert.strictEqual(
      jf2ToWebsiteUrl(jf2),
      `https://${subdomain}.${domain}/notes/${slug}/`
    )
  })

  it('maps a note to the expected URL (JF2, content is html+text)', (t) => {
    const slug = jf2ToSlug(note_jf2)

    t.assert.strictEqual(
      jf2ToWebsiteUrl(note_jf2),
      `https://${subdomain}.${domain}/notes/${slug}/`
    )
  })

  it('generates a URL containing mp-slug, when provided (entry)', (t) => {
    const jf2 = {
      type: 'entry',
      content: 'The most minimal note ever.',
      'mp-slug': 'minimal-note'
    }

    const slug = jf2ToSlug(jf2)

    t.assert.strictEqual(jf2['mp-slug'], slug)
    t.assert.strictEqual(
      jf2ToWebsiteUrl(jf2),
      `https://${subdomain}.${domain}/notes/${slug}/`
    )
  })

  it('maps a read to the expected URL (MF2)', async (t) => {
    const { error, value: jf2 } = await mf2tTojf2({
      items: [indiebookclub_read]
    })

    t.assert.strictEqual(error, undefined)
    const slug = jf2ToSlug(jf2)

    t.assert.strictEqual(
      jf2ToWebsiteUrl(jf2),
      `https://${subdomain}.${domain}/reads/${slug}/`
    )
  })

  it('maps a reply to the expected URL (urlencoded)', (t) => {
    const jf2 = normalizeJf2(reply_urlencoded_mp_syndicate_to)

    const slug = jf2ToSlug(jf2)

    t.assert.strictEqual(
      jf2ToWebsiteUrl(jf2),
      `https://${subdomain}.${domain}/replies/${slug}/`
    )
  })
})
