import { Static, Type } from "@sinclair/typebox";

export const service = Type.Object({
  name: Type.String(),
  url: Type.String(),
  photo: Type.Optional(Type.String()),
});

export type Service = Static<typeof service>;

export const user = Type.Object({
  name: Type.String(),
  url: Type.String(),
  photo: Type.Optional(Type.String()),
});

export type User = Static<typeof user>;

export const syndicate_to_item = Type.Object({
  uid: Type.String(),
  name: Type.String(),
  service: Type.Optional(service),
  user: Type.Optional(user),
});

export type SyndicateToItem = Static<typeof syndicate_to_item>;
