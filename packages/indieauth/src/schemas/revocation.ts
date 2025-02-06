import { Type } from '@sinclair/typebox'

export const revoked = Type.Boolean()

export const revocation_reason = Type.String({
  minLength: 1,
  title: 'Revocation reason',
  description: 'The reason why a token was revoked.'
})
