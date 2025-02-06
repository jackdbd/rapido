import { Static, Type } from '@sinclair/typebox'
import { nullable } from './utils.js'

export const timestamp_ms = Type.Number({
  minimum: 1,
  title: 'Timestamp (ms)',
  description: 'Timestamp in milliseconds since UNIX epoch'
})

export const record_id = Type.Union(
  [
    Type.Number({ minimum: 1 }),
    Type.String({ minLength: 1 })
    // We could also use bigint to store the record ID in databases. However,
    // bigint is problematic both for JSON schema and for JSON.stringify. See
    // these issues:
    // https://github.com/ajv-validator/ajv/issues/1116
    // https://github.com/tc39/proposal-bigint/issues/162
  ],
  {
    title: 'Record ID',
    description:
      'Unique identifier for a record stored in some persistent storage (e.g. a database).'
  }
)

/**
 * Unique identifier for a record stored in some persistent storage (e.g. a database).
 */
export type RecordId = Static<typeof record_id>

export const immutable_record = Type.Object({
  created_at: timestamp_ms,
  id: record_id
})

export type ImmutableRecord = Static<typeof immutable_record>

export const mutable_record = Type.Object({
  created_at: Type.Union([timestamp_ms, Type.Null()]),
  deleted_at: Type.Optional(nullable(timestamp_ms)),
  id: record_id,
  undeleted_at: Type.Optional(nullable(timestamp_ms)),
  updated_at: Type.Optional(nullable(timestamp_ms))
})

export type MutableRecord = Static<typeof mutable_record>
