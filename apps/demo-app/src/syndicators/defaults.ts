import type { Log } from './log.js'

export const chat_id = process.env.TELEGRAM_CHAT_ID

export const token = process.env.TELEGRAM_TOKEN

export const log: Log = {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {}
}

export const DEFAULT = {
  chat_id,
  log,
  token,
  disable_notification: false,
  disable_web_page_preview: false
}
