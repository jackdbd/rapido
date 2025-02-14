import { describe, it } from 'node:test'
import assert from 'node:assert'
import { clientMetadata } from '../lib/index.js'

describe('clientMetadata', () => {
  it('can retrieve client metadata from indiebookclub.biz/id', async () => {
    const client_id = 'https://indiebookclub.biz/id'

    const { error, value: metadata } = await clientMetadata(client_id)

    assert.ok(!error)
    assert.ok(metadata.client_id)
    assert.ok(metadata.client_name)
    assert.ok(metadata.client_uri)
    assert.ok(metadata.logo_uri)
    assert.ok(metadata.redirect_uris)
    assert.equal(metadata.redirect_uris.length, 1)
  })

  it('cannot retrieve client metadata from indiebookclub.biz because it does not include redirect_uri in its HTML', async () => {
    const client_id = 'https://indiebookclub.biz'

    const { error, value: metadata } = await clientMetadata(client_id)

    assert.ok(error)
    assert.ok(error.message.includes('redirect_uri'))
    assert.equal(metadata, undefined)
  })

  it('can retrieve client metadata from indielogin.com/id', async () => {
    const client_id = 'https://indielogin.com/id'

    const { error, value: metadata } = await clientMetadata(client_id)

    assert.ok(!error)
    assert.ok(metadata.client_id)
    assert.ok(metadata.client_name)
    assert.ok(metadata.client_uri)
    assert.ok(metadata.logo_uri)
    assert.ok(metadata.redirect_uris)
    assert.equal(metadata.redirect_uris.length, 1)
  })

  it('can retrieve client metadata from webmention.io/id', async () => {
    const client_id = 'https://webmention.io/id'

    const { error, value: metadata } = await clientMetadata(client_id)

    assert.ok(!error)
    assert.ok(metadata.client_id)
    assert.ok(metadata.client_name)
    assert.ok(metadata.client_uri)
    assert.ok(metadata.logo_uri)
    assert.ok(metadata.redirect_uris)
    assert.equal(metadata.redirect_uris.length, 1)
  })

  it('can retrieve client metadata from quill.p3k.io', async () => {
    const client_id = 'https://quill.p3k.io/'

    const { error, value: metadata } = await clientMetadata(client_id)

    assert.ok(!error)
    assert.ok(metadata.client_id)
    assert.ok(metadata.client_name)
    assert.ok(metadata.client_uri)
    assert.ok(metadata.logo_uri)
    assert.ok(metadata.redirect_uris)
    assert.equal(metadata.redirect_uris.length, 1)
  })

  it('cannot retrieve client metadata from sparkles.sploot.com because it does not include redirect_uri in its HTML', async () => {
    const client_id = 'https://sparkles.sploot.com/'

    const { error, value: metadata } = await clientMetadata(client_id)

    assert.ok(error)
    assert.ok(error.message.includes('redirect_uri'))
    assert.equal(metadata, undefined)
  })
})
