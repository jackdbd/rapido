import {
  dt_accessed,
  dt_published,
  h_cite,
  p_author,
  p_content,
  p_name,
  p_publication,
  u_uid,
  u_url
} from '@jackdbd/microformats2'
import { check, defAjv } from '@repo/stdlib'

const run = () => {
  const ajv = defAjv({
    allErrors: true,
    schemas: [
      dt_accessed,
      dt_published,
      p_author,
      p_content,
      p_name,
      p_publication,
      u_uid,
      u_url
    ]
  })

  const validate = ajv.compile(h_cite)

  check('h-cite (bare minimum)', { type: 'cite' }, validate)

  check(
    'h-cite with author, name and content',
    {
      type: 'cite',
      author: 'Isaac Newton',
      name: 'The Correspondence of Isaac Newton: Volume 5',
      content:
        'If I have seen further it is by standing on the shoulders of Giants.'
    },
    validate
  )
}

run()
