import { Static, Type } from "@sinclair/typebox";
import { dt_duration } from "./dt-duration.js";
import { dt_end } from "./dt-end.js";
import { dt_start } from "./dt-start.js";
import { e_content } from "./e-content.js";
import { p_category } from "./p-category.js";
import { p_content } from "./p-content.js";
import { p_description } from "./p-description.js";
import { p_geo } from "./p-geo.js";
import { p_location } from "./p-location.js";
import { p_name } from "./p-name.js";
import { p_summary } from "./p-summary.js";
import { u_url } from "./u-url.js";
import { h_adr } from "./h-adr.js";

/**
 * microformats2 h-event.
 *
 * All properties are optional.
 *
 * @see https://microformats.org/wiki/h-event
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/microformats#h-event
 */
export const h_event = Type.Object(
  {
    category: Type.Optional(
      Type.Unsafe<Static<typeof p_category>>(Type.Ref(p_category.$id!))
    ),

    content: Type.Optional(
      Type.Union([
        Type.Unsafe<Static<typeof p_content>>(Type.Ref(p_content.$id!)),
        Type.Unsafe<Static<typeof e_content>>(Type.Ref(e_content.$id!)),
      ])
    ),

    description: Type.Optional(
      Type.Unsafe<Static<typeof p_description>>(Type.Ref(p_description.$id!))
    ),

    duration: Type.Optional(
      Type.Unsafe<Static<typeof dt_duration>>(Type.Ref(dt_duration.$id!))
    ),

    end: Type.Optional(
      Type.Unsafe<Static<typeof dt_end>>(Type.Ref(dt_end.$id!))
    ),

    location: Type.Optional(
      Type.Union(
        [
          Type.Unsafe<Static<typeof p_location>>(Type.Ref(p_location.$id!)),
          Type.Unsafe<Static<typeof p_geo>>(Type.Ref(p_geo.$id!)),
          Type.Unsafe<Static<typeof u_url>>(Type.Ref(u_url.$id!)),
          Type.Unsafe<Static<typeof h_adr>>(Type.Ref(h_adr.$id!)),
        ],
        {
          $id: "event-location",
          title: "location",
          description: "Location of the event.",
        }
      )
    ),

    name: Type.Optional(
      Type.Unsafe<Static<typeof p_name>>(Type.Ref(p_name.$id!))
    ),

    start: Type.Optional(
      Type.Unsafe<Static<typeof dt_start>>(Type.Ref(dt_start.$id!))
    ),

    summary: Type.Optional(
      Type.Unsafe<Static<typeof p_summary>>(Type.Ref(p_summary.$id!))
    ),

    type: Type.Literal("event"),

    url: Type.Optional(Type.Unsafe<Static<typeof u_url>>(Type.Ref(u_url.$id!))),
  },
  {
    $id: "h-event",
    title: "microformats2 h-event",
    description:
      "h-event is the microformats2 vocabulary for marking up an event post on web sites. h-event is often used with both event listings and individual event pages.",
    examples: [
      {
        name: "Microformats Meetup",
        start: "2013-06-30 12:00:00-07:00",

        // In order to allow a date format like the one below, I think we would
        // need a custom format for Ajv.
        // start: '30th June 2013, 12:00',

        end: "2013-06-30 18:00:00-07:00",
        location: "Some bar in SF",
        summary: "Get together and discuss all things microformats-related.",
      },
    ],
  }
);

export type H_Event = Static<typeof h_event>;
