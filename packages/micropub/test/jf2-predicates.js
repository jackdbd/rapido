import { describe, it } from "node:test";
import assert from "node:assert";
import {
  isBookmark,
  isCheckin,
  isIssue,
  isLike,
  isNote,
  isRead,
  isReply,
  isRepost,
  isRsvp,
} from "../lib/jf2-predicates.js";

describe("isBookmark", () => {
  it("is true if it has a `bookmark-of` property", () => {
    const jf2 = {
      h: "entry",
      "bookmark-of": "https://example.com/",
    };
    assert.ok(isBookmark(jf2));
  });
});

describe("isCheckin", () => {
  it("is true if it has a `checkin` property", () => {
    const jf2 = {
      h: "entry",
      checkin: "geo:41.8902,12.4922;name=Colosseum",
    };
    assert.ok(isCheckin(jf2));
  });
});

describe("isIssue", () => {
  it("is true if it has a `in-reply-to` property that is a repository hosted on GitHub", () => {
    const jf2 = {
      h: "entry",
      "in-reply-to": "https://github.com/jackdbd/zod-to-doc",
    };
    assert.ok(isIssue(jf2));
  });
});

describe("isLike", () => {
  it("is true if it has a `like-of` property", () => {
    const jf2 = {
      h: "entry",
      "like-of": "https://example.com/",
    };
    assert.ok(isLike(jf2));
  });
});

describe("isNote", () => {
  it("is is true if it has `h=entry` and content is a string", () => {
    const jf2 = {
      h: "entry",
      content: "A note in plain text.",
    };
    assert.ok(isNote(jf2));
  });

  it("is true if it has `h=entry` and content is an object with html and text", () => {
    const jf2 = {
      h: "entry",
      content: {
        html: "<p>A simple <strong>note</strong>.</p>",
        text: "A simple note.",
      },
    };
    assert.ok(isNote(jf2));
  });

  it("is false if it has a `read-of` property", () => {
    const jf2 = {
      h: "entry",
      content: {
        html: "<p>A simple <strong>note</strong>.</p>",
        text: "A simple note.",
      },
      "read-of": "https://example.com/",
      "read-status": "to-read",
    };
    assert.ok(!isNote(jf2));
    assert.ok(isRead(jf2));
  });

  it("is false if it has a `rsvp` property", () => {
    const jf2 = {
      h: "entry",
      content: {
        html: "<p>A simple <strong>note</strong>.</p>",
        text: "A simple note.",
      },
      "in-reply-to": "https://example.com/",
      rsvp: "yes",
    };
    assert.ok(!isNote(jf2));
    assert.ok(isRsvp(jf2));
  });
});

describe("isRead", () => {
  it("is true if it has a `read-of` property and `read-status=finished`", () => {
    const jf2 = {
      h: "entry",
      "read-of": "https://example.com/",
      "read-status": "finished",
    };
    assert.ok(isRead(jf2));
  });
});

describe("isReply", () => {
  it("is true if it has a `in-reply-to` property", () => {
    const jf2 = {
      h: "entry",
      "in-reply-to": "https://example.com/",
    };
    assert.ok(isReply(jf2));
  });
});

describe("isRepost", () => {
  it("is true if it has a `repost-of` property", () => {
    const jf2 = {
      h: "entry",
      "repost-of": "https://example.com/",
    };
    assert.ok(isRepost(jf2));
  });
});

describe("isRsvp", () => {
  it("is true if it has a `in-reply-to` property and `rsvp=maybe`", () => {
    const jf2 = {
      h: "entry",
      "in-reply-to": "https://example.com/",
      rsvp: "maybe",
    };
    assert.ok(isRsvp(jf2));
  });
});
