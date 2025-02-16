import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)

export const REPO_ROOT = path.join(__filename, '..', '..', '..', '..')
export const APPS_ROOT = path.join(REPO_ROOT, 'apps')
export const ASSETS_ROOT = path.join(REPO_ROOT, 'assets')
export const PACKAGES_ROOT = path.join(REPO_ROOT, 'packages')
export const SCHEMAS_ROOT = path.join(REPO_ROOT, 'schemas')
