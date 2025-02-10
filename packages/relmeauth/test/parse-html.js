import { describe, it } from 'node:test'
import { htmlToLinkHrefs } from '../lib/index.js'

describe('htmlToLinkHrefs', () => {
  const head = `
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="description" content="Giacomo Debidda's personal website">
    <meta name="generator" content="Eleventy v3.0.0">
    <title>Hi there!</title>
    <link rel="canonical" href="https://www.giacomodebidda.com/">
    <link rel="me" href="https://github.com/jackdbd">
    <link rel="me" href="mailto:giacomo@giacomodebidda.com">
    <link rel="me" href="https://fosstodon.org/@jackdbd">
  </head>`

  const body = `
  <body>
    <h1>Hello</h1>
    <p>world</p>
  </body>`

  it('finds the expected rel="me" links in the <head>', (t) => {
    const html = `<html lang="en">${head}${body}</html>`

    const { error, value: hrefs } = htmlToLinkHrefs(html)

    t.assert.equal(error, undefined)
    t.assert.equal(hrefs.length, 3)
    t.assert.equal(hrefs[0], 'https://github.com/jackdbd')
    t.assert.equal(hrefs[1], 'mailto:giacomo@giacomodebidda.com')
    t.assert.equal(hrefs[2], 'https://fosstodon.org/@jackdbd')
  })
})
