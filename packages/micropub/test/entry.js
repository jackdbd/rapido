import { describe, it } from 'node:test'
import assert from 'node:assert'
import { defAjv } from '@repo/stdlib/test-utils'
import {
  dt_accessed,
  dt_published,
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
  u_audio,
  p_summary,
  u_syndication,
  u_url,
  u_video
} from '@jackdbd/microformats2'
import {
  access_token,
  action,
  audio,
  date_time,
  entry,
  mp_limit,
  mp_post_status,
  mp_slug,
  mp_syndicate_to,
  mp_visibility,
  photo,
  video
} from '../lib/index.js'

const ajv = defAjv({
  schemas: [
    access_token,
    action,
    audio,
    p_author,
    h_adr,
    h_card,
    date_time,
    dt_accessed,
    dt_published,
    e_content,
    h_cite,
    h_geo,
    mp_limit,
    mp_post_status,
    mp_slug,
    mp_syndicate_to,
    mp_visibility,
    p_geo,
    p_location,
    p_publication,
    p_rsvp,
    p_summary,
    photo,
    u_audio,
    u_url,
    u_syndication,
    u_video,
    video
  ]
})

const validate = ajv.compile(entry)

describe('Micropub entry', () => {
  it('can be an empty objects, since all properties are optional', () => {
    const valid = validate({})

    assert(valid)
    assert(validate.errors === null)
  })

  it('can have a plain test string for content', () => {
    const valid = validate({ content: 'Hello World' })

    assert(valid)
    assert(validate.errors === null)
  })

  it('can be a repost with HTML content', () => {
    const valid = validate({
      'repost-of': 'http://othersite.example.com/permalink47',
      content: {
        html: '<p>You should read this <strong>awesome</strong> article</p>'
      }
    })

    assert(valid)
    assert(validate.errors === null)
  })

  it('can be a note with a photo (URL)', () => {
    const valid = validate({
      content: 'hello world',
      category: ['foo', 'bar'],
      photo: 'https://photos.example.com/592829482876343254.jpg'
    })

    assert(valid)
    assert(validate.errors === null)
  })

  it('can be a note with a photo (URL + alt text)', () => {
    const valid = validate({
      content: 'hello world',
      category: ['foo', 'bar'],
      photo: {
        alt: 'A photo of something cool',
        value: 'https://photos.example.com/592829482876343254.jpg'
      }
    })

    assert(valid)
    assert(validate.errors === null)
  })

  it('can be an RSVP with two syndication targets', () => {
    const valid = validate({
      'in-reply-to':
        'https://aaronparecki.com/2014/09/13/7/indieweb-xoxo-breakfast',
      rsvp: 'maybe',
      'mp-syndicate-to': [
        'https://fosstodon.org/@jackdbd',
        'https://news.indieweb.org/en'
      ]
    })

    assert(valid)
    assert(validate.errors === null)
  })
})
