import type { JF2_Application_JSON } from '@jackdbd/micropub'
import type { Log } from '../log.js'

export interface Success<V = any> {
  uid: string
  value: V
}

export interface Failure<E extends Error = Error> {
  uid: string
  error: E
}

export interface PublishResult<E extends Error = Error, V = any> {
  summary: string
  successes: Success<V>[]
  failures: Failure<E>[]
}

export type BaseProps = Record<string, any>

export type PublishArgs<Props extends BaseProps = BaseProps> = (
  canonicalUrl: URL,
  jf2: JF2_Application_JSON
) => Props[]

export type Publish<
  Props extends BaseProps = BaseProps,
  E extends Error = Error,
  V = any
> = (props: Props) => Promise<PublishResult<E, V>>

export interface SyndicationTarget<
  Props extends BaseProps = BaseProps,
  E extends Error = Error,
  V = any
> {
  uid: string
  publishArgs: PublishArgs<Props>
  publish: Publish<Props, E, V>
}

export interface Config {
  uid: string
}

export interface Options {
  log?: Log
}
