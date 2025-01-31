import * as jf2 from "@jackdbd/micropub/jf2-predicates";
import * as web from "@jackdbd/micropub/website-predicates";
import type { Publication } from "@jackdbd/micropub";

interface Config {
  domain: string;
  subdomain: string;
}

export const defDefaultPublication = (config: Config): Publication => {
  const { domain, subdomain } = config;

  const base_url = subdomain
    ? `https://${subdomain}.${domain}`
    : `https://${domain}`;

  return {
    default: {
      location: {
        store: "default/",
        store_deleted: "deleted/default/",
        website: `${base_url}/default/`,
      },
    },
    items: {
      bookmark: {
        predicate: { store: jf2.isBookmark, website: web.isBookmark },
        location: {
          store: `bookmarks/`,
          // TIP: comment out store_deleted to test that bookmarks can only be
          // hard-deleted and cannot be undeleted.
          store_deleted: "deleted/bookmarks/",
          website: `${base_url}/bookmarks/`,
        },
      },
      card: {
        predicate: { store: jf2.isCard, website: web.isCard },
        location: {
          store: `cards/`,
          store_deleted: "deleted/cards/",
          website: `${base_url}/cards/`,
        },
      },
      checkin: {
        predicate: { store: jf2.isCheckin, website: web.isCheckin },
        location: {
          store: `check-ins/`,
          store_deleted: "deleted/check-ins/",
          website: `${base_url}/check-ins/`,
        },
      },
      event: {
        predicate: { store: jf2.isEvent, website: web.isEvent },
        location: {
          store: `events/`,
          store_deleted: "deleted/events/",
          website: `${base_url}/events/`,
        },
      },
      // issue: {
      //   predicate: { store: jf2.isIssue, website: web.isIssue },
      //   location: {
      //     store: `issues/`,
      //     store_deleted: 'deleted/issues/',
      //     website: `${base_url}/issues/`
      //   }
      // },
      like: {
        predicate: { store: jf2.isLike, website: web.isLike },
        location: {
          store: `likes/`,
          store_deleted: "deleted/likes/",
          website: `${base_url}/likes/`,
        },
      },
      note: {
        predicate: { store: jf2.isNote, website: web.isNote },
        location: {
          store: `notes/`,
          store_deleted: "deleted/notes/",
          website: `${base_url}/notes/`,
        },
      },
      read: {
        predicate: { store: jf2.isRead, website: web.isRead },
        location: {
          store: `reads/`,
          store_deleted: "deleted/reads/",
          website: `${base_url}/reads/`,
        },
      },
      reply: {
        predicate: { store: jf2.isReply, website: web.isReply },
        location: {
          store: `replies/`,
          store_deleted: "deleted/replies/",
          website: `${base_url}/replies/`,
        },
      },
      repost: {
        predicate: { store: jf2.isRepost, website: web.isRepost },
        location: {
          store: `reposts/`,
          store_deleted: "deleted/reposts/",
          website: `${base_url}/reposts/`,
        },
      },
      rsvp: {
        predicate: { store: jf2.isRsvp, website: web.isRsvp },
        location: {
          store: `rsvp/`,
          store_deleted: "deleted/rsvp/",
          website: `${base_url}/rsvp/`,
        },
      },
    },
  };
};
