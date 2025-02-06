import { Type, TSchema } from '@sinclair/typebox'

export const nullable = <S extends TSchema = TSchema>(schema: S) => {
  return Type.Union([schema, Type.Null()])
}
