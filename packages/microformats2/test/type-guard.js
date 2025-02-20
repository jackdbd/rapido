import fs from 'node:fs'
import path from 'node:path'
import { describe, it } from 'node:test'
import { ASSETS_ROOT } from '@repo/stdlib'
import { isMF2, isParsedMF2 } from '../lib/type-guards.js'

const mp_root = path.join(ASSETS_ROOT, 'micropub-requests')
const indiebookclub_root = path.join(mp_root, 'indiebookclub')
const jf2_spec_root = path.join(mp_root, 'jf2-spec')

const indiebookclub_read = JSON.parse(
  fs.readFileSync(path.join(indiebookclub_root, 'read.json'), 'utf-8')
)

const note_jf2 = JSON.parse(
  fs.readFileSync(
    path.join(
      jf2_spec_root,
      'note-jf2-with-content-html-and-content-text.json'
    ),
    'utf-8'
  )
)

const note_mf2 = JSON.parse(
  fs.readFileSync(path.join(jf2_spec_root, 'note-mf2.json'), 'utf-8')
)

describe('isMF2', () => {
  it('is true for note-mf2.json (items: [])', (t) => {
    t.assert.strictEqual(isMF2(note_mf2), true)
  })

  it('is false for note-jf2-with-content-html-and-content-text (type: entry)', (t) => {
    t.assert.strictEqual(isMF2(note_jf2), false)
  })

  it('is false for indiebookclub read.json ("type": ["h-entry"])', (t) => {
    t.assert.strictEqual(isMF2(indiebookclub_read), false)
  })
})

describe('isParsedMF2', () => {
  it('is false for note-mf2.json (items: [])', (t) => {
    t.assert.strictEqual(isParsedMF2(note_mf2), false)
  })

  it('is false for note-jf2-with-content-html-and-content-text (type: entry)', (t) => {
    t.assert.strictEqual(isParsedMF2(note_jf2), false)
  })

  it('is true for indiebookclub read.json ("type": ["h-entry"])', (t) => {
    t.assert.strictEqual(isParsedMF2(indiebookclub_read), true)
  })
})
