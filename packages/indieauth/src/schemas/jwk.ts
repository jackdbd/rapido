import { Static, Type } from '@sinclair/typebox'

export const alg = Type.String({ minLength: 1 })

export const kid = Type.String({ minLength: 1 })

export const jwk_public = Type.Object({
  alg: Type.Optional(alg),
  e: Type.Optional(Type.String({ minLength: 1 })),
  kid: Type.Optional(kid),
  kty: Type.String({ minLength: 1 }),
  n: Type.Optional(Type.String({ minLength: 1 }))
})

export type JWKPublic = Static<typeof jwk_public>

export const jwk_private = Type.Object({
  alg: Type.Optional(alg),
  d: Type.Optional(Type.String({ minLength: 1 })),
  dp: Type.Optional(Type.String({ minLength: 1 })),
  dq: Type.Optional(Type.String({ minLength: 1 })),
  e: Type.Optional(Type.String({ minLength: 1 })),
  kid: Type.Optional(kid),
  kty: Type.String({ minLength: 1 }),
  n: Type.Optional(Type.String({ minLength: 1 })),
  p: Type.Optional(Type.String({ minLength: 1 })),
  q: Type.Optional(Type.String({ minLength: 1 })),
  qi: Type.Optional(Type.String({ minLength: 1 }))
})

export type JWKPrivate = Static<typeof jwk_private>
