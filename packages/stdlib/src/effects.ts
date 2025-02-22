import { log, type Log } from './log.js'

export type ApplyArity0<V = any> = () => Promise<V>

export type ApplyArity1<V = any, Arg0 = any> = (arg0: Arg0) => Promise<V>

export type ApplyArity2<V = any, Arg0 = any, Arg1 = any> = (
  arg0: Arg0,
  arg1: Arg1
) => Promise<V>

export interface Effect<V = any, Arg0 = any, Arg1 = any> {
  uid: string
  apply: ApplyArity1<V, Arg0> | ApplyArity2<V, Arg0, Arg1>
  args?: [] | [Arg0] | [Arg0, Arg1]
  name?: string
}

export interface Success<V = any> {
  uid: string
  value?: V
}

export interface Failure<E extends Error = Error> {
  uid: string
  error: E
}

export interface Options {
  log?: Log
}

const defaults = {
  log
}

const appliedEffect = async <V = any, Arg0 = any, Arg1 = any>(
  fx: Effect<V, Arg0, Arg1>
) => {
  const { uid } = fx
  const name = fx.name || fx.apply.name || 'unknown effect'

  if (!fx.args || fx.args.length === 0) {
    const applyZero = fx.apply as ApplyArity0<V>
    try {
      log.debug(`apply effect ${uid} '${name}' (arity 0)`)
      const value = await applyZero()
      log.debug(`applied effect ${uid} '${name}' (arity 0)`)
      return { uid, success: true, value }
    } catch (ex: any) {
      const error = ex instanceof Error ? ex : new Error(ex)
      log.error(ex)
      return { uid, error }
    }
  }

  if (fx.args && fx.args.length === 1) {
    const applyOne = fx.apply as ApplyArity1<V, Arg0>
    try {
      log.debug(`apply effect ${uid} '${name}' (arity 1)`)
      const value = await applyOne(fx.args[0])
      log.debug(`applied effect ${uid} '${name}' (arity 1)`)
      return { uid, success: true, value }
    } catch (ex: any) {
      const error = ex instanceof Error ? ex : new Error(ex)
      log.error(ex)
      return { uid, error }
    }
  }

  if (fx.args && fx.args.length >= 2) {
    const applyMany = fx.apply as ApplyArity2<V, Arg0, Arg1>
    try {
      log.debug(`apply effect ${uid} '${name}' (arity ${fx.args.length})`)
      const value = await applyMany(...(fx.args as [Arg0, Arg1]))
      log.debug(`applied effect ${uid} '${name}' (arity ${fx.args.length})`)
      return { uid, success: true, value }
    } catch (ex: any) {
      const error = ex instanceof Error ? ex : new Error(ex)
      log.error(ex)
      return { uid, error }
    }
  }

  return { uid, error: new Error(`not reachable`) }
}

export const apply = async <V = any, Arg0 = any, Arg1 = any>(
  effects: Effect<V, Arg0, Arg1>[],
  options?: Options
) => {
  const { log } = Object.assign({}, defaults, options)

  log.info(`started applying ${effects.length} side effects...`)

  const results = await Promise.all(effects.map(appliedEffect))

  const failures = results.filter((res) => res.error) as Failure[]
  const successes = results.filter((res) => res.success) as Success[]
  const summary = `applied ${results.length} effects: ${failures.length} failed, ${successes.length} succeeded`

  return { failures, successes, summary }
}

export const fail = async (..._args: any) => {
  // if (args) {
  //   log.debug(args, `apply ${args.length} args and fail every time`)
  // } else {
  //   log.debug(`apply no args and fail every time`)
  // }
  throw new Error(`this side effect always fails`)
}

export const succeed = async (..._args: any) => {
  // if (args) {
  //   log.debug(args, `apply ${args.length} args and succeed every time`)
  // } else {
  //   log.debug(`apply no args and succeed every time`)
  // }
  return { summary: 'all good' }
}
