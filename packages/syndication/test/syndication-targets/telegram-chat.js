import { describe, it } from 'node:test'
import { defAtom } from '@thi.ng/atom'
import { contentHash, defTelegramChat } from '../../lib/index.js'

const chat_id = process.env.TELEGRAM_CHAT_ID
const bot_token = process.env.TELEGRAM_TOKEN

const state = defAtom({})

// https://loremipsum.io/generator?n=3&t=p
const lorem_ipsum_3_paragraphs = `Lorem ipsum odor amet, consectetuer adipiscing elit. Nostra a imperdiet montes accumsan quis blandit sed nec. Suscipit urna augue et fames montes. Proin iaculis ridiculus pretium, lectus venenatis potenti nisl feugiat. Ornare lectus mus phasellus; libero euismod justo consequat suspendisse. Tempor luctus sed nostra a euismod efficitur neque. Etiam hac ullamcorper dapibus ornare purus vehicula purus?

Habitasse mi accumsan sociosqu litora curae dignissim sapien vulputate. Fringilla augue bibendum eu aenean hendrerit dis fringilla nibh neque? Pellentesque condimentum sem at donec magna maximus maecenas volutpat. Posuere posuere quam nostra sapien maecenas porta. Cursus eu pellentesque non varius ut dictum. Ipsum etiam maecenas fames eu pharetra curae. Class habitasse elit dignissim fringilla facilisis penatibus consectetur. Bibendum porttitor interdum et tortor felis nisl proin. Consectetur tempus ultrices nullam purus imperdiet volutpat euismod dignissim.

Felis lectus eu vulputate montes eleifend tristique adipiscing. Mi consectetur leo vivamus et id vitae ullamcorper. Cubilia ultrices mattis varius adipiscing senectus cursus ut dictum. Accumsan ex mus mi proin himenaeos a nostra placerat. Suspendisse congue orci morbi sollicitudin habitant. Vitae fringilla nibh consequat nunc lacus eget neque interdum. Varius ipsum et tellus aptent felis est odio fusce vel? Dictum quam parturient ligula erat curae gravida. Mi mus lobortis ac ipsum porta imperdiet. Cras orci felis vestibulum libero tempor nibh ante.`

// The Telegram chat is the syndication target
const target = defTelegramChat({
  chat_id,
  bot_token,
  retrieveSyndicateResponse: async (idempotencyKey) => {
    return state.deref()[idempotencyKey]
  },
  storeSyndicateResponse: async (response) => {
    const { idempotencyKey } = response
    state.swap((m) => {
      return { ...m, [idempotencyKey]: response }
    })
  },
  uid: 'telegram-chat-idempotent-consumer'
})

describe('Telegram Chat (idempotent)', () => {
  describe(`jf2ToContents`, () => {
    it(`splits the text content of a Micropub note of ${lorem_ipsum_3_paragraphs.length} characters into more than one Telegram messages`, async (t) => {
      const canonicalUrl = 'https://example.com/'
      const jf2 = { type: 'entry', content: lorem_ipsum_3_paragraphs }
      const textThreshold = 500

      const contents = target.jf2ToContents({
        canonicalUrl,
        jf2,
        textThreshold
      })

      t.assert.ok(lorem_ipsum_3_paragraphs.length > textThreshold)
      t.assert.ok(contents.length > 1)
    })
  })

  describe(`syndicateContent`, () => {
    it('avoids re-processing the same text (idempotent consumer)', async (t) => {
      const [text1, text2] = target.jf2ToContents({
        canonicalUrl: 'https://example.com/',
        jf2: { type: 'entry', content: 'Hello world' },
        textThreshold: 6
      })

      const idempotencyKey1 = contentHash(text1)
      const idempotencyKey2 = contentHash(text2)

      const res1Before = await target.retrieveSyndicateResponse(idempotencyKey1)
      t.assert.strictEqual(res1Before, undefined)

      const res2Before = await target.retrieveSyndicateResponse(idempotencyKey2)
      t.assert.strictEqual(res2Before, undefined)

      // here we syndicate only the first content
      const res1 = await target.syndicateContent(text1, {
        disable_preview: true
      })

      const res1After = await target.retrieveSyndicateResponse(idempotencyKey1)
      t.assert.deepStrictEqual(res1After, res1)

      const res2After = await target.retrieveSyndicateResponse(idempotencyKey2)
      t.assert.strictEqual(res2After, undefined)
    })
  })
})
