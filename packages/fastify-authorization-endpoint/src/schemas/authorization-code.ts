import {
  client_id,
  issuer,
  me_after_url_canonicalization,
} from "@jackdbd/indieauth";
import { redirect_uri, scope } from "@jackdbd/oauth2";
import { code_challenge, code_challenge_method } from "@jackdbd/pkce";
import { Static, Type } from "@sinclair/typebox";
import { immutable_record, mutable_record } from "./record.js";

export const exp = Type.Number({
  description: `UNIX timestamp when the JWT expires`,
  minimum: 0,
  title: '"exp" (Expiration Time) Claim',
});

/**
 * Authorization code issued by the authorization endpoint.
 *
 * OAuth 2.0 does not define a specific format for the authorization code issued
 * by the authorization endpoint. IndieAuth specifies that the authorization
 * code should be a single-use, unguessable, random string. However, it does not
 * prescribe a particular length, encoding, or algorithm to generate the code.
 */
export const code = Type.String({
  minLength: 10,
  maxLength: 128,
  description:
    "Authorization code issued by the authorization endpoint. It should be a single-use, unguessable, random string.",
});

/**
 * Authorization code issued by the authorization endpoint.
 */
export type Code = Static<typeof code>;

export const authorization_code_props = Type.Object(
  {
    client_id,
    code,
    // This works, but it's deprecated
    // code_challenge: Type.Ref(code_challenge),
    // This works, but it's quite verbose
    // code_challenge: Type.Unsafe<Static<typeof code_challenge>>(
    //   Type.Ref("code_challenge")
    // ),
    // This seems to be the best way to do it
    code_challenge: Type.Ref(code_challenge.$id!),
    code_challenge_method: Type.Ref(code_challenge_method.$id!),
    exp,
    iss: Type.Optional(issuer),
    me: me_after_url_canonicalization,
    redirect_uri,
    scope,
    used: Type.Optional(Type.Boolean()),
  },
  {
    $id: "authorization-code-props",
    additionalProperties: false,
    title: "Authorization Code Props",
    description:
      "Properties of an Authorization Code (a storage implementation may have addition properties)",
  }
);

export type AuthorizationCodeProps = Static<typeof authorization_code_props>;

export const authorization_code_immutable_record = Type.Object(
  {
    ...immutable_record.properties,
    ...authorization_code_props.properties,
  },
  {
    $id: "authorization-code-immutable-record",
    additionalProperties: false,
    description: `Represents a record of an authorization code. The values of
    this record should never change. Any updates to the underlying entity should 
    create a new record.`,
    title: "Authorization Code Immutable Record",
  }
);

export type AuthorizationCodeImmutableRecord = Static<
  typeof authorization_code_immutable_record
>;

export const authorization_code_mutable_record = Type.Object(
  {
    ...mutable_record.properties,
    ...authorization_code_props.properties,
  },
  {
    $id: "authorization-code-mutable-record",
    // $schema: 'https://json-schema.org/draft/2020-12/schema',
    additionalProperties: false,
    description: `Represents a record of an authorization code with a predefined
    set of properties (columns). While the structure of the record remains 
    consistent, the values of these properties may change over time.`,
    title: "Authorization Code Mutable Record",
  }
);

export type AuthorizationCodeMutableRecord = Static<
  typeof authorization_code_mutable_record
>;
