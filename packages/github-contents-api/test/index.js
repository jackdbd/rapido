import assert from 'node:assert'
import { after, before, describe, it } from 'node:test'
import { nanoid } from 'nanoid'
import YAML from 'yaml'
import { defAjv } from '@repo/stdlib/test-utils'
import { jf2ToContent } from '../../github-content-store/lib/index.js'
import { rfc3339 } from '../../github-content-store/lib/date.js'
import { get, createOrUpdate, hardDelete } from '../lib/index.js'

// Disable strict mode to ignore unknown keywords like "example".
// In alternative, use `strict: 'log'` to log unknown keywords, or use
// `removeAdditional: true` to remove unknown properties.
const ajv = defAjv({ strict: false })

const TIMEOUT_MS = 10_000

const token = process.env.CONTENTS_API_GITHUB_TOKEN
const owner = 'jackdbd'
const repo = 'test-content'
const ref = 'main'
const committer = {
  name: 'Giacomo Debidda',
  email: 'giacomo@giacomodebidda.com'
}

describe('GitHub contents API', { timeout: TIMEOUT_MS }, () => {
  const test_note_path = `notes/test-note-${nanoid()}.md`
  let test_note_sha

  let schemas
  before(
    async () => {
      const github_open_api_spec_url =
        'https://raw.githubusercontent.com/github/rest-api-description/main/descriptions/api.github.com/api.github.com.yaml'
      const response = await fetch(github_open_api_spec_url, { method: 'GET' })
      const yaml = await response.text()
      const open_api_spec = YAML.parse(yaml)
      schemas = open_api_spec.components.schemas

      const jf2 = {
        h: 'entry',
        content: `This test note was created at ${rfc3339()}`,
        category: ['test', 'github-contents-api'],
        date: rfc3339(),
        visibility: 'public'
      }

      console.log(`trying to create note ${test_note_path}`)
      const { error, value } = await createOrUpdate({
        branch: ref,
        committer,
        content: jf2ToContent(jf2),
        owner,
        path: test_note_path,
        repo,
        token
      })

      if (error) {
        const message =
          error.error_description ||
          `cannot create ${test_note_path} in ${repo}`
        throw new Error(message)
      }

      const content = value.body.content
      test_note_sha = content.sha
      assert.equal(error, undefined)
      assert.notEqual(test_note_sha, undefined)
      console.log(`created note ${test_note_path}`)
    },
    { timeout: TIMEOUT_MS }
  )

  after(
    async () => {
      console.log(`trying to delete note ${test_note_path}`)
      const { error } = await hardDelete({
        committer,
        owner,
        path: test_note_path,
        repo,
        token
      })

      if (error) {
        const message =
          error.error_description ||
          `cannot delete ${test_note_path} in ${repo}`
        throw new Error(message)
      }

      assert.equal(error, undefined)
      console.log(`deleted note ${test_note_path}`)
    },
    { timeout: TIMEOUT_MS }
  )

  it('get returns an error (HTTP 401 Unauthorized) when the GitHub token is invalid', async (t) => {
    const { error, value } = await get({
      owner,
      path: test_note_path,
      ref,
      repo,
      token: 'invalid-token'
    })

    t.assert.notEqual(error, undefined)
    t.assert.equal(error.status_code, 401)
    t.assert.equal(error.status_text, 'Unauthorized')
    t.assert.equal(value, undefined)
  })

  it('get returns a file that matches OpenAPI schema', async (t) => {
    const { error, value } = await get({
      owner,
      path: test_note_path,
      ref,
      repo,
      token
    })

    t.assert.equal(error, undefined)
    const data = value.body

    t.assert.equal(data.encoding, 'base64')
    t.assert.equal(data.type, 'file')
    t.assert.notEqual(data.content, undefined)

    const schema = schemas['content-file']
    const validate = ajv.compile(schema)
    t.assert.ok(validate(data), 'JSON response does not match OpenAPI schema')
  })

  it('createOrUpdate changes the content hash of the updated file', async (t) => {
    const result = await get({
      owner,
      path: test_note_path,
      ref,
      repo,
      token
    })

    t.assert.equal(result.error, undefined)
    const sha_before = result.value.body.sha
    t.assert.notEqual(sha_before, undefined)

    const jf2 = {
      h: 'entry',
      content: `Note updated at ${new Date().toISOString()}`,
      category: ['test', 'github-contents-api'],
      date: rfc3339(),
      updated: rfc3339(),
      visibility: 'public'
    }

    const { error, value } = await createOrUpdate({
      branch: ref,
      committer,
      content: jf2ToContent(jf2),
      owner,
      path: test_note_path,
      repo,
      sha: sha_before,
      token
    })

    t.assert.equal(error, undefined)
    const content = value.body.content
    // const commit = value.body.commit
    t.assert.notEqual(content.sha, undefined)
    t.assert.notEqual(content.sha, sha_before)
  })
})
