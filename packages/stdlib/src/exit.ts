import { EMOJI } from './emojis.js'
import { log } from './log.js'

export const exitOne = (reason: Error | string) => {
  let message = ''
  if (typeof reason === 'string') {
    message = reason
  } else if (reason.message) {
    message = reason.message
  } else {
    message = 'Unknown error'
  }

  log.error(`${EMOJI.EXIT_ONE} ${message}`)
  process.exit(1)
}

export const exitZero = (success: any) => {
  let title = (success && success.summary) || 'Success'
  let data: Record<string, any> | undefined = undefined
  if (success && typeof success === 'object') {
    const { summary, ...rest } = success
    title = summary
    data = rest
  }

  if (data) {
    log.info(JSON.stringify(data, null, 2), `${EMOJI.EXIT_ZERO} ${title}`)
    // log.info(data, `${EMOJI.EXIT_ZERO} ${title}`)
  } else {
    log.info(`${EMOJI.EXIT_ZERO} ${title}`)
  }
  process.exit(0)
}
