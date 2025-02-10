export const EMOJI = {
  ERROR: '❌',
  EXCEPTION: '🚨',
  EXIT_ONE: '🚩'
}

export type Result<V, E extends Error = Error> =
  | { error: E; value?: undefined }
  | { error?: undefined; value: V }

export interface Options<E extends Error = Error> {
  onError?: (error: E) => never
  onUndefinedValue?: () => never
}

const defaults = {
  onError: <E extends Error = Error>(error: E) => {
    console.error(`${EMOJI.ERROR} ${error.message}`)
    throw error
  },
  onUndefinedValue: () => {
    console.error(`${EMOJI.ERROR} value is undefined`)
    throw new Error(`value is undefined`)
  }
}

export const defUnwrap = (options?: Options) => {
  const config = Object.assign({}, defaults, options)

  const { onError, onUndefinedValue } = config

  const unwrap = <V, E extends Error = Error>(result: Result<V, E>) => {
    const { error, value } = result

    if (error) {
      return onError(error)
    }

    if (!value) {
      return onUndefinedValue()
    }
    return value
  }

  return unwrap
}

export const unwrap = defUnwrap()

export const unwrapP = async <V, E extends Error = Error>(
  promise: Promise<Result<V, E>>
) => {
  const result = await promise
  return unwrap(result)
}
