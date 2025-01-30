import { Static, Type } from "@sinclair/typebox";

export const update_patch = Type.Object({
  add: Type.Optional(Type.Any()),
  delete: Type.Optional(Type.String({ minLength: 1 })),
  replace: Type.Optional(Type.Any()),
});

export type UpdatePatch = Static<typeof update_patch>;
