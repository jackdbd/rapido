import {
  send,
  type Options as SendMessageOptions
} from '@jackdbd/notifications/telegram'
import { nop_log, EMOJI, type Log } from '@repo/stdlib'
import { contentHash } from '../content-hash.js'
import { defTexts, TEXT_MAX_LENGTH } from '../telegram-texts.js'
import type {
  RetrieveSyndicateResponse,
  StoreSyndicateResponse,
  SyndicationTarget
} from './api.js'

export interface Config {
  bot_token: string
  chat_id: string
  emoji?: Record<string, string>
  log?: Log
  name?: string
  retrieveSyndicateResponse?: RetrieveSyndicateResponse
  storeSyndicateResponse?: StoreSyndicateResponse
  textThreshold?: number
  uid?: string
}

const defaults = {
  emoji: EMOJI,
  log: nop_log,
  name: 'Telegram Chat',
  textThreshold: Math.floor(TEXT_MAX_LENGTH / 2)
}

// required config+options after all defaults have been applied
const REQUIRED = [
  'bot_token',
  'chat_id',
  'emoji',
  'log',
  'name',
  'textThreshold',
  'uid'
] as const

export const defTelegramChat = (config: Config): SyndicationTarget => {
  const cfg = Object.assign({}, defaults, config) as Required<Config>

  const {
    bot_token: token,
    chat_id,
    log,
    name,
    retrieveSyndicateResponse,
    storeSyndicateResponse,
    uid
  } = cfg

  REQUIRED.forEach((key) => {
    if (!cfg[key]) {
      throw new Error(
        `Cannot create syndication target uid ${uid}: ${key} not set.`
      )
    }
  })

  const syndicateContent = async (
    text: string,
    options: SendMessageOptions
  ) => {
    const idempotencyKey = contentHash(text)

    let res: any // (Record<string, any> & { idempotencyKey: string }) | undefined
    if (retrieveSyndicateResponse) {
      res = await retrieveSyndicateResponse(idempotencyKey)
    }

    if (res) {
      log.warn(
        `retrieved content previously syndicated to Telegram chat ID ${chat_id}`
      )
    } else {
      log.debug(options, `send text to Telegram chat ID ${chat_id}`)
      res = await send({ chat_id, text, token }, options)
      res = { ...res, idempotencyKey }
    }

    if (res && storeSyndicateResponse) {
      await storeSyndicateResponse(res)
      log.debug(
        res,
        `stored response from syndication target ${uid}, together with idempotency key`
      )
    }

    return res
  }

  return {
    jf2ToContents: defTexts,
    name,
    retrieveSyndicateResponse,
    storeSyndicateResponse,
    syndicateContent,
    uid
  }
}
