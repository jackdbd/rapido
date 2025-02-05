import { execSync } from 'node:child_process'
import path from 'node:path'
import { parseArgs } from 'node:util'
import { REPO_ROOT } from '../../stdlib/lib/index.js'

const run = async () => {
  const { values } = parseArgs({
    allowPositionals: false,
    options: {
      'entry-point': { type: 'string', default: 'index.ts' },
      package: { type: 'string', short: 'p' }, // unscoped package name
      theme: { type: 'string', default: 'default' }
    }
  })
  const { package: unscoped_pkg_name, theme } = values
  if (!unscoped_pkg_name) {
    throw new Error('You must provide a package name')
  }

  const packages_root = path.join(REPO_ROOT, 'packages')
  const pkg_root = path.join(packages_root, unscoped_pkg_name)
  const entry_point = path.join(pkg_root, 'src', values['entry-point'])
  const docs_out = path.join(REPO_ROOT, 'docs', unscoped_pkg_name)

  const cmd = `typedoc ${entry_point} --excludeInternal --excludePrivate --out ${docs_out} --theme ${theme}`
  execSync(cmd).toString()
}

run()
