import { Static, Type } from '@sinclair/typebox'

export const p_description = Type.String({
  $id: 'p-description',
  title: 'Description',
  description: 'Description (use in h-event, h-product).',
  minLength: 1
})

export type P_Description = Static<typeof p_description>
