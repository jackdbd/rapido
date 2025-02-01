import { Static, Type } from "@sinclair/typebox";

export const operation = Type.Union([
  Type.Literal("=="),
  Type.Literal("!="),
  Type.Literal("<"),
  Type.Literal("<="),
  Type.Literal(">"),
  Type.Literal(">="),
]);

export type Operation = Static<typeof operation>;

// According to jose's JWTPayload interface, the aud claim could be string or string[].
export const value = Type.Union([
  Type.String({ minLength: 1 }),
  Type.Array(Type.String({ minLength: 1 })),
  Type.Number(),
  Type.Boolean(),
  Type.Undefined(),
]);

export type Value = Static<typeof value>;

export const assertion = Type.Object({
  claim: Type.String({ minLength: 1 }),
  op: Type.Optional(operation),
  value: Type.Optional(Type.Union([value, Type.Any()])),
});

export interface Assertion extends Static<typeof assertion> {
  value?: Value | Function;
}
