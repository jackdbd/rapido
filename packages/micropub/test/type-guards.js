import fs from 'node:fs'
import path from 'node:path'
import { describe, it } from 'node:test'
import { ASSETS_ROOT } from '@repo/stdlib'
import {
  isJF2,
  isMF2,
  isMpUrlencodedRequestBody,
  isParsedMF2
} from '../lib/type-guards.js'

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

const note_simplified = JSON.parse(
  fs.readFileSync(path.join(jf2_spec_root, 'note-simplified.json'), 'utf-8')
)

const note_not_simplified = JSON.parse(
  fs.readFileSync(
    path.join(jf2_spec_root, 'note-parsed-microformats.json'),
    'utf-8'
  )
)

describe('isJF2', () => {
  it('is false for an urlencoded note (h: entry)', (t) => {
    t.assert.strictEqual(isJF2(urlencoded_note), false)
  })

  it('is false for note-parsed-microformats.json (items: [])', (t) => {
    t.assert.strictEqual(isJF2(note_not_simplified), false)
  })

  it('is true for note-simplified.json (type: entry)', (t) => {
    t.assert.strictEqual(isJF2(note_simplified), true)
  })

  it('is false for indiebookclub read.json ("type": ["h-entry"])', (t) => {
    t.assert.strictEqual(isJF2(indiebookclub_read), false)
  })
})

describe('isMF2', () => {
  it('is false for an urlencoded note (h: entry)', (t) => {
    t.assert.strictEqual(isJF2(urlencoded_note), false)
  })

  it('is true for note-parsed-microformats.json (items: [])', (t) => {
    t.assert.strictEqual(isMF2(note_not_simplified), true)
  })

  it('is false for note-simplified.json (type: entry)', (t) => {
    t.assert.strictEqual(isMF2(note_simplified), false)
  })

  it('is false for indiebookclub read.json ("type": ["h-entry"])', (t) => {
    t.assert.strictEqual(isMF2(indiebookclub_read), false)
  })
})

describe('isParsedMF2', () => {
  it('is false for an urlencoded note (h: entry)', (t) => {
    t.assert.strictEqual(isJF2(urlencoded_note), false)
  })

  it('is false for note-parsed-microformats.json (items: [])', (t) => {
    t.assert.strictEqual(isParsedMF2(note_not_simplified), false)
  })

  it('is false for note-simplified.json (type: entry)', (t) => {
    t.assert.strictEqual(isParsedMF2(note_simplified), false)
  })

  it('is true for indiebookclub read.json ("type": ["h-entry"])', (t) => {
    t.assert.strictEqual(isParsedMF2(indiebookclub_read), true)
  })
})

describe('isMpUrlencodedRequestBody', () => {
  it('is true for an urlencoded note (h: entry)', (t) => {
    t.assert.strictEqual(isMpUrlencodedRequestBody(urlencoded_note), true)
  })

  it('is false for note-parsed-microformats.json (items: [])', (t) => {
    t.assert.strictEqual(isMpUrlencodedRequestBody(note_not_simplified), false)
  })

  it('is false for note-simplified.json (type: entry)', (t) => {
    t.assert.strictEqual(isMpUrlencodedRequestBody(note_simplified), false)
  })

  it('is false for indiebookclub read.json ("type": ["h-entry"])', (t) => {
    t.assert.strictEqual(isMpUrlencodedRequestBody(indiebookclub_read), false)
  })
})
