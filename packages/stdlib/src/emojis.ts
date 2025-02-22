// 🚧❌🚨⛔❗🔐🧑🧑‍💻👤🗣️🆘🚩✅🔎🗑️➖🔁🔃♻️🗄️🌐📖📚👍❤️
// https://emojis.wiki/
export const EMOJI: Record<string, string> = {
  ACCESS_TOKEN: '🔑',
  AUDIO: '🎵',
  AUTHORIZATION_CODE: '🔢',
  APPENDED: '➕',
  BOOKMARK: '🔖',
  CLIENT_APPLICATION: '📱',
  CREATED: '🆕',
  DEBUG: '🔎',
  DELETED: '🗑️',
  ERROR: '❌',
  EVENT: '🗓️',
  EXCEPTION: '🚨',
  EXIT_ONE: '🚩',
  EXIT_ZERO: '🏁',
  ID: '🆔',
  INFO: 'ℹ️',
  JAM: '🎵',
  JTI: '🔑',
  LIKE: '👍',
  ME: '👤',
  NOTE: '📝',
  PHOTO: '📷',
  PROFILE: '👤',
  QUERY: '❓',
  READ: '📚',
  REFRESH_TOKEN: '🌱',
  REMOVED: '🚮',
  REPOST: '🔃',
  RETRIEVED: '📤',
  REVOKED: '🚫',
  ROWID: '🆔',
  RSVP: '🗓️',
  SEARCH: '🔎',
  STORED: '📥',
  TEST: '🧪',
  TOKEN_ISSUED: '🔑',
  UNDELETED: '🔁',
  UNKNOWN: '🤷',
  UPDATED: '🆙',
  ALL_TOKENS_REVOKED: '🚧',
  VIDEO: '🎞️',
  WARNING: '⚠️'
}

export const toEmoji = (str: string) => {
  const k = str.toUpperCase().trim()
  return EMOJI[k] || EMOJI.EXIT_ONE
}
