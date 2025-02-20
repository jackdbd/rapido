import { Static, Type } from '@sinclair/typebox'
import { date } from './date.js'

export const dt_reviewed = Type.Union([date], {
  $id: 'dt-reviewed',
  title: 'Reviewed at',
  description:
    'Date or date-time of when something was reviewed or will be reviewed (e.g. h-review).'
})

export type DT_Reviewed = Static<typeof dt_reviewed>
