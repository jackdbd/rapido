import type {
  JF2,
  JF2_JSON,
  JF2_Urlencoded_Or_Multipart
} from './schemas/jf2.js'
import { isMpUrlencodedRequestBody } from './type-guards.js'

/**
 * Predicate to check whether a JF2 object has an `h` property.
 *
 * This predicate can be useful when we want to make sure that in another
 * predicate function we reject objects that have this property. For example:
 *
 * ```js
 * if (hasH(jf2)) {
 *   throw new Error(`received an object that has an 'h' property`)
 * }
 * ```
 */
export const hasH = (input: any) => {
  if (input && input.h) {
    return true
  } else {
    return false
  }
}

export const isBookmark = (jf2: JF2) => {
  if (jf2['bookmark-of']) {
    return true
  } else {
    return false
  }
}

export const isCard = (jf2: JF2_JSON | JF2_Urlencoded_Or_Multipart) => {
  if (isMpUrlencodedRequestBody(jf2)) {
    if (jf2.h === 'card') {
      return true
    } else {
      return false
    }
  } else {
    if (jf2.type === 'card') {
      return true
    } else {
      return false
    }
  }
}

/**
 * @see https://indieweb.org/checkin
 */
export const isCheckin = (jf2: JF2) => {
  if (jf2['checkin']) {
    return true
  } else {
    return false
  }
}

export const isCite = (jf2: JF2_JSON | JF2_Urlencoded_Or_Multipart) => {
  if (isMpUrlencodedRequestBody(jf2)) {
    if (jf2.h === 'cite') {
      return true
    } else {
      return false
    }
  } else {
    if (jf2.type === 'cite') {
      return true
    } else {
      return false
    }
  }
}

/**
 * Whether a `jf2` object has either `"type": "entry"` or `"h": "entry"`
 *
 * **NOTE**: It's better to name this predicate `hasEntry` instead of `isEntry`
 * because the default type of a Micropub post is `entry`.
 * This means that if other predicates check for the presence of the `type`
 * property, should treat its absence as the `jf2` object having:
 *
 * - `"type": "entry"` when `Content-Type` is `application/json`
 * - `"h": "entry"` when `Content-Type` is either
 *   `application/x-www-form-urlencoded` or `multipart/form-data`
 */
export const hasEntry = (jf2: JF2_JSON | JF2_Urlencoded_Or_Multipart) => {
  if (isMpUrlencodedRequestBody(jf2)) {
    if (jf2.h === 'entry') {
      return true
    } else {
      return false
    }
  } else {
    if (jf2.type === 'entry') {
      return true
    } else {
      return false
    }
  }
}

export const isEvent = (jf2: JF2) => {
  if (isMpUrlencodedRequestBody(jf2)) {
    if (jf2.h === 'event') {
      return true
    }
  } else {
    if (jf2.type === 'event') {
      return true
    }
  }

  if (jf2.name && jf2.start && jf2.location) {
    return true
  } else {
    return false
  }
}

/**
 * @see https://indieweb.org/issue
 */
export const isIssue = (jf2: JF2) => {
  if (jf2['in-reply-to']) {
    if (jf2['in-reply-to'].includes('github.com')) {
      return true
    }
  }

  return false
}

export const isLike = (jf2: JF2) => {
  if (jf2['like-of']) {
    return true
  } else {
    return false
  }
}

export const isNote = (jf2: JF2) => {
  // note is a very generic type. We can disambiguate it by checking if JF2 is
  // NOT one of the more specific types.
  if (
    isBookmark(jf2) ||
    isCheckin(jf2) ||
    isLike(jf2) ||
    isRead(jf2) ||
    isReply(jf2) ||
    isRepost(jf2) ||
    isRsvp(jf2)
  ) {
    return false
  }

  if (!jf2.content) {
    return false
  }

  if (typeof jf2.content === 'string') {
    return true
  }

  if (jf2.content.html && jf2.content.text) {
    return true
  }

  return false
}

/**
 * @see https://indieweb.org/read
 */
export const isRead = (jf2: JF2) => {
  if (!jf2['read-of']) {
    return false
  }

  switch (jf2['read-status']) {
    case 'to-read':
    case 'reading':
    case 'finished': {
      return true
    }
    default: {
      return false
    }
  }
}

export const isReply = (jf2: JF2) => {
  if (!jf2['in-reply-to']) {
    return false
  }

  // reply is quite a generic type. We can disambiguate it from a RSVP by
  // checking that first.
  if (isRsvp(jf2)) {
    return false
  }

  return true
}

/**
 * @see https://indieweb.org/repost
 */
export const isRepost = (jf2: JF2) => {
  if (jf2['repost-of']) {
    return true
  } else {
    return false
  }
}

/**
 * @see https://indieweb.org/rsvp
 */
export const isRsvp = (jf2: JF2) => {
  // rsvp is a subtype of reply
  if (!jf2['in-reply-to']) {
    return false
  }

  switch (jf2['rsvp']) {
    case 'yes':
    case 'no':
    case 'maybe':
    case 'interested': {
      return true
    }
    default: {
      return false
    }
  }
}
