import { conformResult, type Config, type Options } from './conform-result.js'

/**
 * Validates that a value conforms to a schema. Throws if the validation failes.
 */
export const throwWhenNotConform = <V>(
  config: Config<V>,
  options?: Options
) => {
  const { error } = conformResult(config, options)
  if (error) {
    throw error
  }
}
