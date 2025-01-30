import { Static, Type } from "@sinclair/typebox";

export const ajv = Type.Any({ description: "Instance of Ajv" });

export const action = Type.Union([
  Type.Literal("delete"),
  Type.Literal("undelete"),
  Type.Literal("update"),
  Type.Literal("create"),
]);

export type Action = Static<typeof action>;
