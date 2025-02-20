import { describe, it } from 'node:test'
import assert from 'node:assert'
import { defAjv } from '@repo/stdlib/test-utils'
import {
  dt_accessed,
  dt_published,
  dt_updated,
  e_content,
  h_adr,
  h_card,
  h_cite,
  h_entry,
  h_geo,
  p_author,
  p_geo,
  p_location,
  p_publication,
  p_rsvp,
  p_summary,
  u_syndication,
  u_url
} from '../lib/index.js'

const ajv = defAjv({
  allErrors: true,
  schemas: [
    dt_accessed,
    dt_published,
    dt_updated,
    e_content,
    h_adr,
    h_card,
    h_cite,
    h_geo,
    p_author,
    p_geo,
    p_location,
    p_publication,
    p_rsvp,
    p_summary,
    u_syndication,
    u_url
  ]
})

// const validate = ajv.getSchema(h_entry.$id);
const validate = ajv.compile(h_entry)

describe('h_entry', () => {
  it('can be an empty objects, since all properties are optional', () => {
    const valid = validate({})
    assert(valid)
    assert(validate.errors === null)
  })

  it('can be a bookmark with plain text content', () => {
    const valid = validate({
      'bookmark-of': 'https://mxb.dev/blog/make-free-stuff/',
      content: 'Nice article!'
    })
    assert(valid)
    assert(validate.errors === null)
  })

  it('can be a like-of', () => {
    const valid = validate({
      'like-of': 'http://othersite.example.com/permalink47'
    })
    assert(valid)
    assert(validate.errors === null)
  })

  it('can be a repost-of', () => {
    const valid = validate({
      'repost-of': 'https://example.com/post'
    })
    assert(valid)
    assert(validate.errors === null)
  })

  it('can be a RSVP', () => {
    const valid = validate({
      'in-reply-to':
        'https://aaronparecki.com/2014/09/13/7/indieweb-xoxo-breakfast',
      rsvp: 'maybe'
    })
    assert(valid)
    assert(validate.errors === null)
  })

  it('can be a note that has both plain text and html', () => {
    const valid = validate({
      content: {
        text: 'this is a note',
        html: '<p>This <b>is</b> a note</p>'
      },
      published: '1985-04-12T23:20:50.52Z'
    })
    assert(valid)
    assert(validate.errors === null)
  })
})
