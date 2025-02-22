import c from 'ansi-colors'
import { EMOJI } from './emojis.js'

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Log {
  debug: (...args: any[]) => void
  info: (...args: any[]) => void
  warn: (...args: any[]) => void
  error: (...args: any[]) => void
}

const messageAndData = (args: any[]) => {
  let message: string
  let data: Record<string, any> | undefined = undefined
  if (args.length === 1) {
    message = args[0]
  } else {
    data = args[0]
    message = args[1]
  }
  return { message, data }
}

export const nop_log: Log = {
  debug: (..._args: any[]) => {},
  info: (..._args: any[]) => {},
  warn: (..._args: any[]) => {},
  error: (..._args: any[]) => {}
}

export const log: Log = {
  debug: (...args: any[]) => {
    const { message, data } = messageAndData(args)
    if (data) {
      console.log(c.blue(message), data)
    } else {
      console.log(c.blue(message))
    }
  },
  info: (...args: any[]) => {
    const { message, data } = messageAndData(args)
    if (data) {
      console.log(c.green(message), data)
    } else {
      console.log(c.green(message))
    }
  },
  warn: (...args: any[]) => {
    const { message, data } = messageAndData(args)
    if (data) {
      console.log(c.yellow(`${EMOJI.WARNING} ${message}`), data)
    } else {
      console.log(c.yellow(`${EMOJI.WARNING} ${message}`))
    }
  },
  error: (...args: any[]) => {
    const { message, data } = messageAndData(args)
    if (data) {
      console.log(c.red(message), data)
    } else {
      console.log(c.red(message))
    }
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */
