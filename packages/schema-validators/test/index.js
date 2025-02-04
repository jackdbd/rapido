import assert from 'node:assert'
import { describe, it } from 'node:test'
import { Type } from '@sinclair/typebox'
import { defAjv } from '../../stdlib/lib/test-utils.js'
import { code_challenge } from '../../pkce/lib/index.js'
import { conformResult, throwWhenNotConform } from '../lib/index.js'

const ajv = defAjv()

describe('conformResult', () => {
  it('returns a result object with an error an no value when data does not conform', () => {
    const schema = Type.String({ minLength: 1 })
    const { error, value } = conformResult({ ajv, schema, data: '' })

    assert.ok(error)
    assert.ok(!value)
  })

  it('returns a result object with the validated value and no error when data conforms', () => {
    const schema = Type.String({ minLength: 1 })
    const data = 'hello'
    const { error, value } = conformResult({ ajv, schema, data })

    assert.ok(!error)
    assert.ok(value)
    assert.equal(value.validated, data)
  })

  it("errors out, when a schema has one or more $ref that can't be resolved", () => {
    const schema = Type.Object(
      {
        foo: Type.String({ minLength: 1 }),
        code_challenge: Type.Ref(code_challenge.$id)
      },
      { $id: 'schema-with-one-unresolvable-$ref' }
    )

    const foo = 'bar'
    const challenge = Array.from({ length: 43 }, () => 'x').join('')

    const data = { foo, code_challenge: challenge }

    const { error, value } = conformResult({ ajv, schema, data })

    assert.ok(error)
    assert.ok(error.message.includes("can't resolve reference"))
    assert.ok(error.message.includes('$ref'))
    assert.ok(!value)
  })
})

it('does not error out, when schema has one or more $ref that is added to Ajv before calling the function', () => {
  const schema = Type.Object(
    {
      foo: Type.String({ minLength: 1 }),
      code_challenge: Type.Ref(code_challenge.$id)
    },
    { $id: 'schema-with-one-resolved-$ref' }
  )

  const foo = 'bar'
  const challenge = Array.from({ length: 43 }, () => 'x').join('')

  const data = { foo, code_challenge: challenge }
  ajv.addSchema(code_challenge)

  const { error, value } = conformResult({ ajv, schema, data })

  assert.ok(!error)
  assert.equal(value.validated.foo, foo)
  assert.equal(value.validated.code_challenge, challenge)
})

describe('throwWhenNotConform', () => {
  it('throws when data does not conform', () => {
    const schema = Type.String({ minLength: 1 })

    assert.throws(() => {
      throwWhenNotConform({ ajv, schema, data: '' })
    })
  })

  it('returns undefined when data conforms', () => {
    const schema = Type.String({ minLength: 1 })
    const value = throwWhenNotConform({ ajv, schema, data: 'hello' })

    assert.equal(value, undefined)
  })
})
