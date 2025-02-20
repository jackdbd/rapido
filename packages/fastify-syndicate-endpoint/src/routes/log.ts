export type LogFnArity1 = (msg: string) => void
export type LogFnArity2 = (data: Record<string, any>, msg: string) => void

export interface Log {
  debug: LogFnArity1 | LogFnArity2
  info: LogFnArity1 | LogFnArity2
  warn: LogFnArity1 | LogFnArity2
  error: LogFnArity1 | LogFnArity2
}
