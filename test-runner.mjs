import { readdirSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { run } from 'node:test'
import { spec } from 'node:test/reporters'
import { fileURLToPath } from 'node:url'

// I created this file to debug all tests in this monorepo and I am launching it
// using this command:
// NODE_ENV=test node --inspect-brk test-runner.mjs
// However, the debugger does not seem to reliably stop at the breakpoints I
// added. It stops at the first couple of breakpoints, and then it stops at
// random places. I guess I have to configure runoptions in a different way.

const EXCLUDED_PACKAGES = [
  'error-handlers',
  'prettier-config',
  'scripts',
  'stdlib',
  'typescript-config'
]

const __filename = fileURLToPath(import.meta.url)
const packages_root = path.join(__filename, '..', 'packages')

const files = readdirSync(packages_root)
  .filter((s) => !EXCLUDED_PACKAGES.includes(s))
  .flatMap((unscoped_pkg_name) => {
    const test_root = path.join(packages_root, unscoped_pkg_name, 'test')
    const test_filepaths = readdirSync(test_root).map((filename) => {
      return path.join(test_root, filename)
    })
    return test_filepaths
  })

console.log(`running tests on ${files.length} files`)

// https://nodejs.org/api/test.html#runoptions
run({ concurrency: 1, files, inspectPort: 9229, isolation: 'process' })
  .on('test:fail', () => {
    process.exitCode = 1
  })
  .compose(spec)
  .pipe(process.stdout)
