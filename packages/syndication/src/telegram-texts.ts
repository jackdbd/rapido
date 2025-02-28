import type { JF2_Application_JSON } from '@jackdbd/micropub'
import { EMOJI, nop_log, type Log } from '@repo/stdlib'
import { defText } from './telegram-text.js'

// https://core.telegram.org/bots/api#sendmessage
export const TEXT_MAX_LENGTH = 4096

interface Config {
  canonicalUrl: URL | string
  emoji?: Record<string, string>
  jf2: JF2_Application_JSON
  log?: Log
  textThreshold?: number
}

// required config after all defaults have been applied
const REQUIRED = ['canonicalUrl', 'emoji', 'jf2', 'log'] as const

const defaults = {
  emoji: EMOJI,
  log: nop_log,
  textThreshold: Math.floor(TEXT_MAX_LENGTH / 2)
}

/**
 * Telegram texts created from a single JF2 object.
 *
 * This function does not send any text. It justs converts a single JF2 object
 * into multiple texts. Each text honors the limits of the
 * [Telegram Bot `sendMessage` API](https://core.telegram.org/bots/api#sendmessage).
 */

export const defTexts = (config: Config) => {
  const cfg = Object.assign({}, defaults, config)

  REQUIRED.forEach((key) => {
    if (!cfg[key]) {
      throw new Error(`${key} not set.`)
    }
  })

  const { jf2, log, textThreshold } = cfg

  let contentLens: (jf2: JF2_Application_JSON) => string = (_jf2) => ''
  if (jf2.content) {
    if (typeof jf2.content === 'string') {
      contentLens = (jf2) => jf2.content as string
    } else if (jf2.content.text) {
      contentLens = (jf2) => (jf2.content as { text: string }).text as string
    } else if (jf2.content.html) {
      contentLens = (jf2) => (jf2.content as { html: string }).html as string
    }
  }

  if (!contentLens(jf2)) {
    log.debug(
      `jf2 has no content; assuming is no longer than ${textThreshold} characters`
    )
    return [defText(config)]
  }

  if (contentLens(jf2).length <= textThreshold) {
    log.debug(`jf2 has content that fits ${textThreshold} characters`)
    return [defText(config)]
  }

  log.warn(
    `jf2 has content that does NOT fit ${textThreshold} characters; splitting into multiple texts`
  )
  const texts: string[] = []

  const msg = {
    count: 0,
    // length of the remaining content to process
    len: contentLens(jf2).length,
    start: 0,
    stop: textThreshold
  }

  while (msg.len > 0) {
    const content = contentLens(jf2).slice(msg.start, msg.stop) + `\n...`
    texts.push(defText({ ...config, jf2: { ...jf2, content } }))
    msg.count++
    msg.start = msg.stop
    msg.stop = Math.min(msg.stop + textThreshold, contentLens(jf2).length)
    msg.len = Math.max(0, msg.len - textThreshold)
    log.debug(
      {
        msg
        // textThreshold
        // remainder: contentLens(jf2).slice(msg.start, msg.stop)
      },
      `Content after Telegram text ${msg.count} (${msg.len} characters left)`
    )
  }

  return texts
}
