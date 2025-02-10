import { describe, it } from 'node:test'
import { unwrap, unwrapP, defUnwrap } from '../lib/index.js'

describe('unwrap', () => {
  it('throws an error that has the expected error message when value is undefined', (t) => {
    const message = 'expected error message'

    t.assert.throws(
      () => {
        unwrap({ error: new Error(message), value: undefined })
      },
      { message }
    )
  })

  it('unwraps the value from the result object when there is no error', (t) => {
    const expected = 123

    t.assert.strictEqual(
      unwrap({ error: undefined, value: expected }),
      expected
    )
  })
})

describe('unwrapP', () => {
  it('throws an error that has the expected error message when value is undefined', (t) => {
    const message = 'expected error message'

    t.assert.rejects(
      unwrapP({
        error: new Error(message),
        value: undefined
      }),
      { message }
    )
  })

  it('unwraps the value from the result object when there is no error', async (t) => {
    const expected = 123

    const actual = await unwrapP({ error: undefined, value: expected })
    t.assert.strictEqual(actual, expected)
  })
})

describe('defUnwrap', () => {
  it('allows to pass a custom onError handler', (t) => {
    const value_on_error = 'default value'
    const unwrap = defUnwrap({ onError: (_error) => value_on_error })

    const actual = unwrap({ error: new Error('foo'), value: undefined })
    t.assert.equal(actual, value_on_error)
  })
})
