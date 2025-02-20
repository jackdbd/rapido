import { Static, Type } from '@sinclair/typebox'
import { date } from './date.js'

export const dt_bday = Type.Union([date], {
  $id: 'dt-bday',
  title: 'Birthday',
  description: 'Date or date-time of a birthday.'
})

export type DT_Bday = Static<typeof dt_bday>
