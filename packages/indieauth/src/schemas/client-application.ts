import { Static, Type } from '@sinclair/typebox'
import { redirect_uri } from './common.js'
import { me_after_url_canonicalization } from './me.js'
import { immutable_record, mutable_record } from './record.js'

/**
 * The ID of the application that asks for authorization.
 *
 * An IndieAuth client ID is always a URL.
 */
export const client_id = Type.String({
  description:
    'The ID of the application that asks for authorization. An IndieAuth client ID is a URL.',
  format: 'uri'
})

export const client_application_props = Type.Object(
  {
    client_id,
    me: me_after_url_canonicalization,
    redirect_uri
  },
  {
    $id: 'client-application-props',
    additionalProperties: false,
    title: 'Client Application Props',
    description:
      'Properties of a client application (a storage implementation may have addition properties)'
  }
)

export type ClientApplicationProps = Static<typeof client_application_props>

export const client_application_immutable_record = Type.Object(
  {
    ...immutable_record.properties,
    ...client_application_props.properties
  },
  {
    $id: 'client-application-immutable-record',
    additionalProperties: false,
    description: `Represents a record of a client application. The values of
      this record should never change. Any updates to the underlying entity should 
      create a new record.`,
    title: 'Client Application Immutable Record'
  }
)

export type ClientApplicationImmutableRecord = Static<
  typeof client_application_immutable_record
>

export const client_application_mutable_record = Type.Object(
  {
    ...mutable_record.properties,
    ...client_application_props.properties
  },
  {
    $id: 'client-application-mutable-record',
    // $schema: 'https://json-schema.org/draft/2020-12/schema',
    additionalProperties: false,
    description: `Represents a record of a client application with a predefined
    set of properties (columns). While the structure of the record remains 
    consistent, the values of these properties may change over time.`,
    title: `Client Application Mutable Record`
  }
)

export type ClientApplicationMutableRecord = Static<
  typeof client_application_mutable_record
>
