import {
  dt_accessed,
  dt_duration,
  dt_end,
  dt_published,
  dt_start,
  dt_updated,
  e_content,
  h_adr,
  h_card,
  h_cite,
  h_entry,
  h_event,
  h_geo,
  h_item,
  p_author,
  p_description,
  p_geo,
  p_location,
  p_publication,
  p_rsvp,
  p_summary,
  u_syndication,
  u_url
} from '@jackdbd/microformats2'
import { check, defAjv } from '../../stdlib/lib/test-utils.js'

const run = async () => {
  const ajv = defAjv({
    allErrors: true,
    schemas: [
      dt_accessed,
      dt_duration,
      dt_end,
      dt_published,
      dt_start,
      dt_updated,
      e_content,
      h_adr,
      h_card,
      h_cite,
      h_geo,
      p_author,
      p_description,
      p_geo,
      p_location,
      p_publication,
      p_rsvp,
      p_summary,
      u_syndication,
      u_url
    ]
  })

  const validateHAdr = ajv.getSchema(h_adr.$id!)!
  const validateHEntry = ajv.compile(h_entry)
  const validateHCard = ajv.compile(h_card)
  const validateHCite = ajv.compile(h_cite)
  const validateHEvent = ajv.compile(h_event)
  const validateHItem = ajv.compile(h_item)
  const validateHGeo = ajv.compile(h_geo)
  const validatePGeo = ajv.compile(p_geo)

  check('plain text note', { content: 'plain text note' }, validateHEntry)

  check(
    'note that has an HTML representation',
    {
      content: {
        text: 'note that has an HTML representation',
        html: '<p>note that has an HTML representation/p>'
      }
    },
    validateHEntry
  )

  check(
    'note with published datetime',
    {
      content: 'note with published datetime',
      // https://datatracker.ietf.org/doc/html/rfc3339#section-5.6
      // This represents 20 minutes and 50.52 seconds after the 23rd hour of
      // April 12th, 1985 in UTC.
      published: '1985-04-12T23:20:50.52Z'
    },
    validateHEntry
  )

  check(
    'bare minimum JF2 card',
    { name: 'My JF2 card', type: 'card' },
    validateHCard
  )

  check(
    'bare minimum JF2 cite',
    {
      name: 'Parallel Lives',
      author: 'Plutarch',
      type: 'cite'
    },
    validateHCite
  )

  check(
    'bare minimum JF2 event',
    { name: 'Some event', type: 'event' },
    validateHEvent
  )

  check(
    'JF2 event',
    {
      name: 'Microformats Meetup',
      //   start: '2013-06-30 12:00:00',
      start: '2013-06-30T14:30:50.52Z',
      //   end: '2013-06-30 18:00:00',
      end: '2013-06-30T18:00:00.99Z',
      location: 'Some bar in SF',
      summary: 'Get together and discuss all things microformats-related.',
      type: 'event'
    },
    validateHEvent
  )

  check('geo', { latitude: -89.99, longitude: 179.99 }, validateHGeo)

  check('Geo URI with lat/long', 'geo:46.772673,-71.282945', validatePGeo)
  check(
    'Geo URI with lat/long and uncertainty',
    'geo:46.772673,-71.282945;u=35',
    validatePGeo
  )

  check(
    'adr',
    {
      'street-address': '17 Austerstræti',
      locality: 'Reykjavík',
      'country-name': 'Iceland',
      'postal-code': '107'
    },
    validateHAdr
  )

  check(
    'item',
    {
      name: 'The Item Name',
      photo: 'http://example.org/items/1/photo.png',
      url: 'http://example.org/items/1',
      type: 'item'
    },
    validateHItem
  )
}

run()
