import { Static, Type } from '@sinclair/typebox'
import { date } from './date.js'

export const dt_anniversary = Type.Union([date], {
  $id: 'dt-anniversary',
  title: 'Anniversary',
  description: 'Date or date-time of an anniversary.'
})

export type DT_Anniversary = Static<typeof dt_anniversary>
