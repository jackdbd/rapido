import Ajv from 'ajv'
import type { Options, Plugin, ValidateFunction } from 'ajv'
import addFormats from 'ajv-formats'
import { EMOJI } from './emojis.js'
import { log } from './log.js'

export const defAjv = (options?: Options) => {
  const opt = Object.assign({}, { allErrors: true }, options)
  // I have no idea why I have to do this to make TypeScript happy.
  // In JavaScript, Ajv and addFormats can be imported without any of this mess.
  const addFormatsPlugin = addFormats as any as Plugin<string[]>

  const ajv_with_formats = addFormatsPlugin(new Ajv.Ajv(opt), [
    'date',
    'date-time',
    'duration',
    'email',
    'hostname',
    'ipv4',
    'ipv6',
    'iso-date-time',
    'iso-time',
    'json-pointer',
    'regex',
    'relative-json-pointer',
    'time',
    'uri',
    'uri-reference',
    'uri-template',
    'uuid'
  ])

  return ajv_with_formats
}

export const check = (what: string, value: any, validate: ValidateFunction) => {
  const valid = validate(value)
  console.log(`is '${what}' valid?`, valid)

  // console.log('value after validation (and after defaults when Ajv useDefaults: true)')
  // console.log(value)

  if (validate.errors) {
    validate.errors.forEach((error, i) => {
      log.error(error, `${EMOJI.ERROR} validation error ${i + 1} in '${what}'`)
    })
  }
}
