import fs from 'node:fs'
import path from 'node:path'
import { ASSETS_ROOT } from '@repo/stdlib'

export const SAMPLE_URL = {
  article: 'https://www.giacomodebidda.com/articles/playwright-on-nixos/',
  note: 'https://www.giacomodebidda.com/notes/test-note-quill-with-no-image/',
  redirect:
    'https://www.giacomodebidda.com/posts/a-few-timeless-lessons-from-peopleware'
}

export const SAMPLE_FEED_URL = {
  articles: 'https://www.giacomodebidda.com/feeds/articles.xml',
  notes: 'https://www.giacomodebidda.com/feeds/notes.xml'
}

export const mf2_root = path.join(ASSETS_ROOT, 'microformats2')

export const SAMPLE_HTML = {
  'blog-post': fs.readFileSync(path.join(mf2_root, 'blog-post.html'), 'utf-8'),
  card: fs.readFileSync(path.join(mf2_root, 'card.html'), 'utf-8'),
  note: fs.readFileSync(path.join(mf2_root, 'note.html'), 'utf-8')
}

const mp_root = path.join(ASSETS_ROOT, 'micropub-requests')
const indiebookclub_root = path.join(mp_root, 'indiebookclub')
const indiepass_root = path.join(mp_root, 'indiepass')
const jf2_spec_root = path.join(mp_root, 'jf2-spec')
const quill_root = path.join(mp_root, 'quill')

export const SAMPLE_JF2 = {
  bookmark: JSON.parse(
    fs.readFileSync(path.join(jf2_spec_root, 'bookmark.json'), 'utf-8')
  ),
  event: JSON.parse(
    fs.readFileSync(path.join(jf2_spec_root, 'event-jf2.json'), 'utf-8')
  ),
  like: JSON.parse(
    fs.readFileSync(path.join(jf2_spec_root, 'like.json'), 'utf-8')
  ),
  note: JSON.parse(
    fs.readFileSync(
      path.join(quill_root, 'note-jf2-mp-syndicate-to.json'),
      'utf-8'
    )
  ),
  read: JSON.parse(
    fs.readFileSync(path.join(indiebookclub_root, 'read.json'), 'utf-8')
  ),
  rsvp: JSON.parse(
    fs.readFileSync(path.join(indiepass_root, 'rsvp-jf2.json'), 'utf-8')
  )
}
