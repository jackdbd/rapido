import {
  p_altitude,
  p_latitude,
  p_longitude,
  h_geo
} from '@jackdbd/microformats2'
import { check, defAjv } from '@repo/stdlib'

const run = () => {
  const ajv = defAjv({
    allErrors: true,
    schemas: [p_altitude, p_latitude, p_longitude]
  })

  const validate = ajv.compile(h_geo)

  check('h-geo (bare minimum)', {}, validate)

  check(
    'h-geo with latitude and longitude',
    {
      latitude: 41.902782,
      longitude: 12.496366
    },
    validate
  )
}

run()
