import { Static, Type } from '@sinclair/typebox'
import { immutable_record, mutable_record } from './record.js'

export const name = Type.String({ minLength: 1 })

export const url = Type.String({ format: 'uri' })

export const photo = Type.String({ format: 'uri' })

export const email = Type.String({ format: 'email' })

/**
 * [IndieAuth profile information](https://indieauth.spec.indieweb.org/#profile-information).
 */
export const profile = Type.Object({
  name,
  url,
  photo,
  email: Type.Optional(email)
})

export type Profile = Static<typeof profile>

export const user_profile_props = Type.Object(
  { ...profile.properties },
  {
    $id: 'user-profile-props',
    additionalProperties: false,
    description: "Properties of a user's profile",
    title: 'User Profile Props'
  }
)

export type UserProfileProps = Static<typeof user_profile_props>

export const user_profile_immutable_record = Type.Object(
  {
    ...immutable_record.properties,
    ...user_profile_props.properties
  },
  {
    $id: 'user-profile-immutable-record',
    additionalProperties: false,
    description: `Represents a record of a user's profile. The values of this record should never change. Any updates to the underlying entity should create a new record.`,
    title: 'User Profile Immutable Record'
  }
)

export type UserProfileImmutableRecord = Static<
  typeof user_profile_immutable_record
>

export const user_profile_mutable_record = Type.Object(
  {
    ...mutable_record.properties,
    ...user_profile_props.properties
  },
  {
    $id: 'user-profile-mutable-record',
    additionalProperties: false,
    description: `Represents a record of a user's profile with a predefined set of properties (columns). While the structure of the record remains consistent, the values of these properties may change over time.`,
    title: 'User Profile Mutable Record'
  }
)

export type UserProfileMutableRecord = Static<
  typeof user_profile_mutable_record
>
