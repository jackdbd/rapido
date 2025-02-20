import fs from 'node:fs'
import path from 'node:path'
import { describe, it } from 'node:test'
import { ASSETS_ROOT } from '@repo/stdlib'
import { isJF2, isMpUrlencodedRequestBody } from '../lib/type-guards.js'

const mp_root = path.join(ASSETS_ROOT, 'micropub-requests')
const indiebookclub_root = path.join(mp_root, 'indiebookclub')
const jf2_spec_root = path.join(mp_root, 'jf2-spec')

const urlencoded_note = {
  h: 'entry',
  content: 'A simple note.'
}

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

describe('isJF2', () => {
  it('is true for an empty object', (t) => {
    t.assert.strictEqual(isJF2({}), true)
  })

  it('is false for an empty object if we pass application/x-www-form-urlencoded as the content-type', (t) => {
    t.assert.strictEqual(isJF2({}, 'application/x-www-form-urlencoded'), false)
  })

  it('is false for an urlencoded note (h: entry)', (t) => {
    t.assert.strictEqual(isJF2(urlencoded_note), false)
  })

  it('is false for note-mf2.json (items: [])', (t) => {
    t.assert.strictEqual(isJF2(note_mf2), false)
  })

  it('is true for note-jf2-with-content-html-and-content-text (type: entry)', (t) => {
    t.assert.strictEqual(isJF2(note_jf2), true)
  })

  it('is false for indiebookclub read.json ("type": ["h-entry"])', (t) => {
    t.assert.strictEqual(isJF2(indiebookclub_read), false)
  })
})

describe('isMpUrlencodedRequestBody', () => {
  it('is false for an empty object', (t) => {
    t.assert.strictEqual(isMpUrlencodedRequestBody({}), false)
  })

  it('is true for an empty object if we pass application/x-www-form-urlencoded as the content-type', (t) => {
    t.assert.strictEqual(
      isMpUrlencodedRequestBody({}, 'application/x-www-form-urlencoded'),
      true
    )
  })

  it('is true for an urlencoded note (h: entry)', (t) => {
    t.assert.strictEqual(isMpUrlencodedRequestBody(urlencoded_note), true)
  })

  it('is false for note-mf2.json (items: [])', (t) => {
    t.assert.strictEqual(isMpUrlencodedRequestBody(note_mf2), false)
  })

  it('is false for note-jf2-with-content-html-and-content-text (type: entry)', (t) => {
    t.assert.strictEqual(isMpUrlencodedRequestBody(note_jf2), false)
  })

  it('is false for indiebookclub read.json ("type": ["h-entry"])', (t) => {
    t.assert.strictEqual(isMpUrlencodedRequestBody(indiebookclub_read), false)
  })
})
