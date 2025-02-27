import { describe, it } from 'node:test'
import assert from 'node:assert'
import { defAjv } from '@repo/stdlib'
import {
  dt_duration,
  dt_end,
  dt_start,
  e_content,
  h_adr,
  h_event,
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
} from '../lib/index.js'

const ajv = defAjv({
  allErrors: true,
  schemas: [
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
  ]
})

const validate = ajv.compile(h_event)

describe('h_event', () => {
  it('can be an event that has start, end, location, name, summary', () => {
    const valid = validate({
      type: 'event',
      name: 'Microformats Meetup',
      start: '2013-06-30 12:00:00-07:00',
      end: '2013-06-30 18:00:00-07:00',
      location: 'Some bar in SF',
      summary: 'Get together and discuss all things microformats-related.'
    })

    assert(valid)
    assert(validate.errors === null)
  })

  it('can have dates in the YYYY-MM-DD format', () => {
    const jf2 = {
      type: 'event',
      name: 'Microformats Meetup',
      start: '2013-06-30',
      location: 'Some bar in SF'
    }

    const valid = validate(jf2)

    assert(valid)
    assert(validate.errors === null)
  })
})
