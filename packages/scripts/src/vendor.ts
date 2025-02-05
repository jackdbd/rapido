import { execSync } from 'node:child_process'
import { cpSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { parseArgs } from 'node:util'
import { REPO_ROOT } from '../../stdlib/lib/index.js'

interface Config {
  compile_dependency?: boolean
  dependency_name_scoped: string
  package_name_unscoped: string
  packages_root: string
}

const vendorize = (config: Config) => {
  const {
    compile_dependency,
    dependency_name_scoped: dep_scoped,
    package_name_unscoped: pkg_unscoped,
    packages_root
  } = config

  if (!dep_scoped) {
    throw new Error('dependency_name_scoped is required')
  }
  const dep_unscoped = dep_scoped.split('/')[1]
  if (!dep_unscoped) {
    throw new Error(`Internal package has unexpected name: ${dep_scoped}`)
  }

  if (compile_dependency) {
    const dep_pkg_root = path.join(packages_root, dep_unscoped)
    console.log(`compile ${dep_scoped}`)
    const cmd = `npx tsc -p ${path.join(dep_pkg_root, 'tsconfig.json')}`
    execSync(cmd).toString()
  }

  const src = path.join(packages_root, dep_unscoped, 'lib')
  const dest = path.join(packages_root, pkg_unscoped, 'lib', dep_unscoped)
  console.log(`copy ${src} to ${dest}`)
  cpSync(src, dest, { recursive: true })

  const filepath = path.join(packages_root, pkg_unscoped, 'lib', 'index.js')
  console.log(`adjust imports in ${filepath}`)
  const original = readFileSync(filepath, 'utf-8')
  const str = original.replaceAll(dep_scoped, `./${dep_unscoped}/index.js`)
  writeFileSync(filepath, str, 'utf-8')
}

const run = async () => {
  const { values } = parseArgs({
    allowPositionals: false,
    options: {
      package: { type: 'string', short: 'p' } // unscoped package name
    }
  })
  const package_name_unscoped = values.package
  if (!package_name_unscoped) {
    throw new Error('You must provide a package name')
  }

  const packages_root = path.join(REPO_ROOT, 'packages')
  const pkg_root = path.join(packages_root, package_name_unscoped)

  const pkg = JSON.parse(
    readFileSync(path.resolve(pkg_root, 'package.json'), 'utf-8')
  )

  const internal_packages = Object.keys(pkg.internalPackages)

  internal_packages.forEach((dependency_name_scoped) => {
    vendorize({ dependency_name_scoped, packages_root, package_name_unscoped })
  })
}

run()
