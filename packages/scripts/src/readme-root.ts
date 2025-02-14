import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { parseArgs } from 'node:util'
import {
  compactEmptyLines,
  image,
  licenseLink,
  link,
  transcludeFile
} from '@thi.ng/transclude'
import { calloutWarning, REPO_ROOT } from '../../stdlib/lib/index.js'

const EXCLUDED_PACKAGES = [
  'error-handlers',
  'prettier-config',
  'scripts',
  'stdlib',
  'typescript-config'
]

const run = async () => {
  const { values } = parseArgs({
    allowPositionals: false,
    options: {
      // git reference could be a branch (e.g. main, canary) or a git tag (e.g. v1.0.0-canary.6)
      git_ref: { type: 'string', default: 'main' },
      github_username: { type: 'string', default: 'jackdbd' },
      npm_scope: { type: 'string', default: '@jackdbd' },
      output: { type: 'string', default: path.join(REPO_ROOT, 'README.md') },
      started_in_year: { type: 'string', default: '2024' }
    }
  })

  const { git_ref, github_username, npm_scope, output } = values
  // const github_username = npm_scope.replace('@', '') as string
  const project_started_in_year = parseInt(values.started_in_year)

  const root_pkg = JSON.parse(
    readFileSync(path.join(REPO_ROOT, 'package.json'), 'utf-8')
  )

  const repo_name = root_pkg.name
  console.log(`Building ${output} for repository ${repo_name}`)

  const items = readdirSync(path.join(REPO_ROOT, 'packages'))
    .filter((s) => !EXCLUDED_PACKAGES.includes(s))
    .map((unscoped_pkg_name) => {
      const pkg_href = `https://github.com/${github_username}/${repo_name}/tree/${git_ref}/packages/${unscoped_pkg_name}`
      const scoped_pkg_name = `${npm_scope}/${unscoped_pkg_name}`

      const pkg = JSON.parse(
        readFileSync(
          path.join(REPO_ROOT, 'packages', unscoped_pkg_name, 'package.json'),
          'utf-8'
        )
      )

      const version = pkg.version

      const home = link(scoped_pkg_name, pkg_href)

      const typedoc = link(
        'Docs',
        `https://${github_username}.github.io/${repo_name}/${unscoped_pkg_name}/${version}`
      )

      const npm_version = link(
        image(
          `https://badge.fury.io/js/${npm_scope}%2F${unscoped_pkg_name}.svg`,
          'npm version'
        ),
        `https://badge.fury.io/js/${npm_scope}%2F${unscoped_pkg_name}`
        // `https://www.npmjs.com/package/${npm_scope}/${unscoped_pkg_name}`
      )

      const install_size = link(
        image(
          `https://packagephobia.com/badge?p=${npm_scope}/${unscoped_pkg_name}`,
          'install size'
        ),
        `https://packagephobia.com/result?p=${npm_scope}/${unscoped_pkg_name}`
      )

      return {
        docs: typedoc,
        home,
        install_size,
        npm_version
      }
    })

  const rows = items.map((d) => {
    const row = [d.home, d.npm_version, d.install_size, d.docs].join(' | ')
    return `| ${row} |`
  })

  const table = [
    `| Package | Version | Install size | Docs |`,
    '|---|---|---|---|',
    rows.join('\n')
  ].join('\n')

  const current_year = new Date().getFullYear()

  const transcluded = transcludeFile(path.join(REPO_ROOT, 'tpl.readme.md'), {
    user: root_pkg.author,
    templates: {
      // 'callout.esmOnly': callout({
      //   // emoji: '[!IMPORTANT]',
      //   emoji: '📦',
      //   title: `ESM only`,
      //   message: `All packages of this monorepo are published to npmjs.com as ECMAScript modules **only** (i.e. there are no CJS builds).`
      // }),
      'callout.esmOnly': calloutWarning([
        `All packages of this monorepo are published to npmjs.com as ECMAScript modules **only** (i.e. there are no CJS builds).`
      ]),

      'pkg.description': root_pkg.description,

      'pkg.license': ({ user }) => {
        const copyright =
          current_year > project_started_in_year
            ? `&copy; ${project_started_in_year} - ${current_year}`
            : `&copy; ${current_year}`

        const lines = [
          `## License`,
          '\n\n',
          `${copyright} ${link(
            user.name,
            'https://www.giacomodebidda.com/'
          )} // ${licenseLink(root_pkg.license)}`
        ]
        return lines.join('')
      },

      packages: () => {
        return `## Packages\n\n${table}`
      }
    },
    post: [compactEmptyLines]
  })

  writeFileSync(output, transcluded.src)
  console.log(`wrote ${output}`)
}

run()
