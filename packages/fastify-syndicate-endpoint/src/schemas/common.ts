import { Type } from '@sinclair/typebox'
import { DEFAULT } from '../constants.js'

export const include_error_description = Type.Boolean({
  description: `Whether to include an \`error_description\` property in all error responses. This is meant to assist the client developer in understanding the error. This is NOT meant to be shown to the end user.`,
  default: DEFAULT.INCLUDE_ERROR_DESCRIPTION
})

export const log_prefix = Type.String({ default: DEFAULT.LOG_PREFIX })

export const report_all_ajv_errors = Type.Boolean({
  description: 'Whether to report all AJV validation errors.',
  title: 'report all AJV errors',
  default: DEFAULT.REPORT_ALL_AJV_ERRORS
})
