export interface Log {
  debug: (...args: any) => void
  info: (...args: any) => void
  warn: (...args: any) => void
  error: (...args: any) => void
}
