import {
  send,
  type Options as SendMessageOptions
} from '@jackdbd/notifications/telegram'
import { EMOJI } from '../emojis.js'
import { log } from '../log.js'
import { defTexts } from '../telegram-texts.js'
import type {
  Failure,
  PublishArgs,
  Success,
  SyndicationTarget,
  Config as SyndicationTargetConfig,
  Options as SyndicationTargetOptions
} from './api.js'

export interface Config extends SyndicationTargetConfig {
  bot_token: string
  chat_id: string
}

export interface Options extends SyndicationTargetOptions, SendMessageOptions {
  emoji?: Record<string, string>
  name?: string
}

const defaults = {
  emoji: EMOJI,
  log,
  name: 'Telegram Chat'
}

// required config+options after all defaults have been applied
const REQUIRED = ['bot_token', 'chat_id', 'log', 'name'] as const

interface Props extends SendMessageOptions {
  chat_id: string
  text: string
  token: string
}

export const defTelegramChat = (
  config: Config,
  options?: Options
): SyndicationTarget<Props> => {
  const cfg = Object.assign({}, config, defaults, options) as Required<
    Config & Options
  >

  const {
    bot_token: token,
    chat_id,
    emoji,
    log,
    name,
    uid,
    ...sendOptions
  } = cfg

  REQUIRED.forEach((key) => {
    if (!cfg[key]) {
      throw new Error(
        `Cannot create syndication target uid ${uid}: ${key} not set.`
      )
    }
  })

  const publishArgs: PublishArgs<Props> = (canonicalUrl, jf2) => {
    const texts = defTexts({ canonicalUrl, emoji, jf2, log })
    log.debug(
      `syndication to ${name} (uid: ${uid}) will send ${texts.length} texts to Telegram chat ID ${chat_id}`
    )
    return texts.map((text) => {
      return { ...sendOptions, chat_id, text, token }
    })
  }

  const failures: Failure[] = []
  const successes: Success[] = []

  const publish = async (props: Props) => {
    const { chat_id, text, token, ...sendOptions } = props
    log.debug(sendOptions, `send text to Telegram chat ID ${chat_id}`)

    try {
      const value = await send({ chat_id, text, token }, sendOptions)
      if (value.delivered) {
        successes.push({ uid, value })
      } else {
        const reason =
          value.message || `Text not delivered to Telegram chat ID ${chat_id}`
        failures.push({ uid, error: new Error(reason) })
      }
    } catch (ex: any) {
      if (ex instanceof Error) {
        failures.push({ uid, error: ex })
      } else {
        const reason = ex && ex.message ? ex.message : 'Unknown error'
        failures.push({ uid, error: new Error(reason) })
      }
    }

    const summary = [
      `Syndication to target ${uid} completed:`,
      `${successes.length} effects succeeded,`,
      `${failures.length} effects failed.`
    ].join(' ')

    return { summary, successes, failures }
  }

  return { uid, publishArgs, publish }
}
