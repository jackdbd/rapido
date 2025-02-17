import type { FastifyError } from 'fastify'

interface MessageMap {
  [message: string]: { allowed_values: string[] }
}

export const errorDescription = (error: FastifyError) => {
  if (!error) {
    return {
      error: new Error(`Cannot create error_description: error not available`)
    }
  }

  if (!error.validation) {
    return {
      error: new Error(
        `Cannot create error_description: error.validation not available`
      )
    }
  }

  if (!error.validationContext) {
    return {
      error: new Error(
        `Cannot create error_description: error.validationContext not available`
      )
    }
  }

  const message_map: MessageMap = {}

  error.validation.forEach((ve) => {
    const msg = `${error.validationContext}${ve.instancePath} ${ve.message}`

    const allowed_values: any = []
    for (const [k, val] of Object.entries(ve.params)) {
      if (k === 'allowedValue') {
        allowed_values.push(val)
      }
    }

    if (message_map[msg]) {
      message_map[msg].allowed_values.push(...allowed_values)
    } else {
      message_map[msg] = { allowed_values }
    }
  })

  const messages = Object.entries(message_map)
    .filter(([msg]) => {
      return !msg.includes('must match a schema in anyOf')
    })
    .map(([msg, { allowed_values }]) => {
      if (allowed_values.length > 0) {
        return `${msg} (allowed values: ${allowed_values.join(', ')})`
      } else {
        return msg
      }
    })

  return { value: messages.join('; ') }
}
