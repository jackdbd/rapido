import { Static, Type } from '@sinclair/typebox'
import { date } from './date.js'

export const dt_start = Type.Union([date], {
  $id: 'dt-start',
  title: 'Start at',
  description: 'Date or date-time when something starts (e.g. an h-event).'
})

export type DT_Start = Static<typeof dt_start>
