import { execSync } from 'node:child_process'
import { EMOJI } from './emojis.js'

export interface Config {
  filepath: string
  level: number // initial markdown heading level
}

export const schemaToMarkdown = (config: Config) => {
  const { filepath, level } = config

  // jsonschema2mk does not support file sytem refs, so a TypeBox schema like
  // this one will cause jsonschema2mk to throw:
  // ```
  // const foo: Type.Object({ abc: "def" }) // this is fine
  // const bar: Type.Ref(foo.$id) // this causes jsonschema2mk to throw
  // ```

  // https://github.com/simonwalz/jsonschema2mk#command-line-options
  const cmd = `jsonschema2mk --schema ${filepath} --level ${level}`
  try {
    const value = execSync(cmd).toString()
    return { value }
  } catch (ex: any) {
    const md = [
      `${EMOJI.ERROR} Could not generate markdown from schema because this command failed:`,
      '\n',
      '```sh',
      `${cmd}`,
      '```',
      'Here is the error message:',
      '\n',
      '```sh',
      `${ex.message}`,
      '```'
    ].join('\n')
    return {
      error: new Error(md)
    }
  }
}

export const safeSchemaToMarkdown = (config: Config) => {
  const { filepath, level } = config

  const { error, value } = schemaToMarkdown({ filepath, level })

  if (error) {
    return error.message
  } else {
    return value
  }
}
