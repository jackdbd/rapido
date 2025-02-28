import { createHash } from 'node:crypto'

export const contentHash = (content: string | Buffer) => {
  return createHash('sha256').update(content).digest('hex')
}
