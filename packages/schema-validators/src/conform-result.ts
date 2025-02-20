import { betterAjvErrors } from '@apideck/better-ajv-errors'
import { Type } from '@sinclair/typebox'
import type { TSchema } from '@sinclair/typebox'
import type { Ajv, Schema, SchemaObject, ValidateFunction } from 'ajv'

const any_value = Type.Any()

interface Log {
  debug: (message: string) => void
  // info: (message: string) => void
  warn: (message: string) => void
  // error: (message: string) => void
}

export interface Config<V> {
  ajv: Ajv
  schema: Schema
  data: V
}

export interface Options {
  basePath?: string
  ignoreKeys?: string[]
  log?: Log
  replacement?: TSchema
  validationErrorsSeparator?: string
}

const defaults = {
  basePath: '',
  ignoreKeys: [],
  log: {
    debug: (_message: string) => {},
    warn: (_message: string) => {}
  },
  replacement: any_value,
  validationErrorsSeparator: ';'
}

// TODO: these traverse functions do not support an arbitrary level of nesting.
// They currently support only one level of nesting.
//
// Traversing an array at nesting level 0 (supported):
// schema.properties[key][i] = replacement
// Traversing an object at nesting level 0 (supported):
// schema.properties[key].items.properties[k] = replacement

const traverseArray = (
  schema: SchemaObject,
  value: any[],
  key: string,
  replacement: any,
  log: Log,
  log_prefix: string
) => {
  log.debug(`${log_prefix}property ${key} is an array`)

  value.forEach((val, i) => {
    if (typeof val === 'function') {
      log.debug(`${log_prefix}replace ${key}[${i}] because it's a function`)
      schema.properties[key][i] = replacement
    } else if (typeof val === 'object') {
      traverseObject(schema, val, key, replacement, log, log_prefix)
    }
  })
}

const traverseObject = (
  schema: SchemaObject,
  value: Record<string, any>,
  key: string,
  replacement: any,
  log: Log,
  log_prefix: string
) => {
  log.debug(`${log_prefix}property ${key} is an object`)

  Object.entries(value).forEach(([k, v], j) => {
    log.debug(`${log_prefix}property ${key} is an object`)
    if (typeof v === 'function') {
      log.debug(
        `${log_prefix}replace ${key}.items[${j}][${k}] because it's a function`
      )
      schema.properties[key].items.properties[k] = replacement
    } else if (Array.isArray(v)) {
      traverseArray(schema, v, k, replacement, log, log_prefix)
    }
  })
}

// TODO: I think the caller has to dereference all $ref pointers in the schema
// passed to this function. I don't think this function can resolve $refs that
// might be available only on the caller's filesystem.
// https://github.com/APIDevTools/json-schema-ref-parser

/**
 * Validates that a value conforms to a schema. Returns a result object.
 */
export const conformResult = <V>(config: Config<V>, options?: Options) => {
  const { ajv, schema, data } = config

  const opt = Object.assign({}, defaults, options)
  const {
    basePath,
    log,
    replacement,
    validationErrorsSeparator: separator
  } = opt

  const ignore = new Set(opt.ignoreKeys)
  const log_prefix = basePath ? `[conform ${basePath}] ` : '[conform] '

  let spec = 'schema'
  if (typeof schema !== 'boolean') {
    spec = `schema '${schema.title}'`
    if (schema.$id) {
      spec = `schema ID '${schema.$id}'`
    }
  }

  // Workaround to handle functions in a schema. Here is why we need this:
  // TypeBox allows defining functions in schemas, but JSON Schema (and
  // therefore Ajv) does not support them. Ajv will throw an error if it
  // encounters a function in the schema. To address this, we replace each
  // function definition in the schema with Type.Any(), which is the most
  // generic type available in TypeBox.
  // See also:
  // https://github.com/sinclairzx81/typebox?tab=readme-ov-file#javascript-types
  for (const [key, value] of Object.entries(data as Record<string, any>)) {
    if (typeof schema === 'boolean') {
      log.debug(`${log_prefix}nothing to do, since schema is a boolean`)
      continue
    }

    if (ignore.has(key)) {
      log.warn(
        `${log_prefix}ignore property ${key} because explicitely skipped`
      )
      schema.properties[key] = any_value
    }

    if (typeof value === 'function') {
      log.debug(`${log_prefix}replace ${key} because it's a function`)
      schema.properties[key] = replacement
    } else if (Array.isArray(value)) {
      traverseArray(schema, value, key, replacement, log, log_prefix)
    } else if (typeof value === 'object') {
      traverseObject(schema, value, key, replacement, log, log_prefix)
    }
  }

  const suggestions: string[] = []
  if (typeof schema !== 'boolean') {
    if (schema.properties) {
      for (const [key, skema] of Object.entries(schema.properties)) {
        const sk = skema as TSchema
        if (sk.$ref) {
          const warning = `property ${key} refers schema ID ${sk.$ref}. Either pass a schema that has all $ref pointers dereferenced, or pass those schemas when you instantiate Ajv, or call ajv.addSchema() for each $ref schema.`
          log.warn(`${log_prefix}${warning}`)
          suggestions.push(warning)
        }
      }
    }
  }

  // This try/catch serves two purposes:
  // 1. Keep returning a result object
  // 2. Build a clearer error message
  let validate: ValidateFunction
  try {
    validate = ajv.compile(schema)
  } catch (ex: any) {
    const summary = ex && ex.message ? ex.message : 'Unknown error'
    const message =
      suggestions.length > 0
        ? `${summary}. Suggestions: ${suggestions.join('; ')}`
        : summary
    return { error: new Error(message) }
  }

  validate(data)

  if (!validate.errors) {
    return {
      value: {
        message: `value conforms to ${spec}`,
        validated: data
      }
    }
  }

  let errors: string[] = []
  if (typeof schema === 'boolean') {
    errors = validate.errors.map((ve) => {
      return `${ve.message} (basePath: ${basePath}, instancePath: ${ve.instancePath}, schemaPath: ${ve.schemaPath})`
    })
  } else {
    let defaultBasePath = ''
    if (schema.type) {
      defaultBasePath = schema.type
    }
    if (schema.title) {
      defaultBasePath = schema.title
    }
    if (schema.$id) {
      defaultBasePath = schema.$id
    }

    const validation_errors = betterAjvErrors({
      schema,
      data,
      errors: validate.errors,
      // If basePath is an empty string, we do NOT want to replace it. This
      // means that we need to use the the nullish coalescing operator (using a
      // logical OR operator would be incorrect).
      basePath: basePath ?? defaultBasePath
    })

    errors = validation_errors.map((ve) => {
      return `${ve.message} (path: ${ve.path})`
    })
  }

  return { error: new Error(errors.join(separator)) }
}
