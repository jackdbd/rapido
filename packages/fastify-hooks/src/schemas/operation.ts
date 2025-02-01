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
