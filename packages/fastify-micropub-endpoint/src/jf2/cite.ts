import { type Static, Type } from "@sinclair/typebox";
import { h_cite } from "@jackdbd/microformats2";
import { mp_slug, mp_syndicate_to } from "./micropub-reserved-properties.js";

export const mp_cite = Type.Object(
  {
    ...h_cite.properties,

    h: Type.Literal("cite"),

    "mp-slug": Type.Optional(
      Type.Unsafe<Static<typeof mp_slug>>(Type.Ref(mp_slug.$id!))
    ),
    "mp-syndicate-to": Type.Optional(
      Type.Unsafe<Static<typeof mp_syndicate_to>>(
        Type.Ref(mp_syndicate_to.$id!)
      )
    ),

    // Since in Micropub we use `h` to indicate the type of the object, we don't
    // need `type` to be present. But if it is, it must be 'cite'.
    type: Type.Optional(Type.Literal("cite")),
  },
  { $id: "micropub-cite", title: "Micropub h=cite" }
);

export type MP_Cite = Static<typeof mp_cite>;
