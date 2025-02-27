import { describe, it } from 'node:test'
import assert from 'node:assert'
import { defAjv } from '@repo/stdlib'
import {
  dt_duration,
  dt_end,
  dt_start,
  e_content,
  h_adr,
  h_geo,
  p_altitude,
  p_category,
  p_content,
  p_description,
  p_geo,
  p_latitude,
  p_location,
  p_longitude,
  p_name,
  p_summary,
  u_url
} from '@jackdbd/microformats2'
import { event, mp_slug, mp_syndicate_to } from '../lib/index.js'

const ajv = defAjv({
  schemas: [
    dt_duration,
    dt_end,
    dt_start,
    e_content,
    h_adr,
    h_geo,
    mp_slug,
    mp_syndicate_to,
    p_altitude,
    p_category,
    p_content,
    p_description,
    p_geo,
    p_latitude,
    p_location,
    p_longitude,
    p_name,
    p_summary,
    u_url
  ]
})

const validate = ajv.compile(event)

describe('Micropub event', () => {
  it('can have start/end, location, a suggested slug and two syndication targets', () => {
    const valid = validate({
      type: 'event',
      location: 'Some bar in SF',
      name: 'Microformats Meetup',
      start: '2013-06-30 12:00:00-07:00',
      end: '2013-06-30 18:00:00-07:00',
      summary: 'Get together and discuss all things microformats-related.',
      'mp-slug': 'microformats-meetup-in-sf',
      'mp-syndicate-to': [
        'https://fosstodon.org/@jackdbd',
        'https://news.indieweb.org/en'
      ]
    })

    assert(valid)
    assert(validate.errors === null)
  })
})
