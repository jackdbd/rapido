# @jackdbd/fastify-token-endpoint

[![npm version](https://badge.fury.io/js/@jackdbd%2Ffastify-token-endpoint.svg)](https://badge.fury.io/js/@jackdbd%2Ffastify-token-endpoint)
[![install size](https://packagephobia.com/badge?p=@jackdbd/fastify-token-endpoint)](https://packagephobia.com/result?p=@jackdbd/fastify-token-endpoint)
[![CodeCov badge](https://codecov.io/gh/jackdbd/rapido/graph/badge.svg?token=BpFF8tmBYS)](https://app.codecov.io/gh/jackdbd/rapido?flags%5B0%5D=fastify-token-endpoint)
[![Socket Badge](https://socket.dev/api/badge/npm/package/@jackdbd/fastify-token-endpoint)](https://socket.dev/npm/package/@jackdbd/fastify-token-endpoint)

Fastify plugin that adds an [IndieAuth Token Endpoint](https://indieauth.spec.indieweb.org/#token-endpoint) to a Fastify server.

An IndieAuth Token Endpoint is responsible for generating and verifying OAuth 2.0 Bearer Tokens.

- [Installation](#installation)
- [Token Endpoint Options](#token-endpoint-options)
  - [jwks: object](#jwks-object)
    - [jwks\.keys\[\]: array](#jwkskeys-array)
- [Access tokens](#access-tokens)
- [Refresh tokens](#refresh-tokens)
- [User-provided functions](#user-provided-functions)
  - [`isAccessTokenRevoked`](#isaccesstokenrevoked)
  - [`onIssuedTokens`](#onissuedtokens)
  - [`retrieveRefreshToken`](#retrieverefreshtoken)
- [Dependencies](#dependencies)
- [References](#references)
- [License](#license)

## Installation

```sh
npm install @jackdbd/fastify-token-endpoint
```

## Token Endpoint Options

Options for the Fastify token-endpoint plugin

**Properties**

|Name|Type|Description|Required|
|----|----|-----------|--------|
|**accessTokenExpiration**<br/>(Token expiration)|`string`|Human-readable expiration time for the token issued by the token endpoint.<br/>Default: `"15 minutes"`<br/>Minimal Length: `1`<br/>|no|
|**ajv**||Instance of Ajv<br/>|no|
|**authorizationEndpoint**<br/>(Authorization endpoint)|`string`|URL of the authorization server's authorization endpoint.<br/>Format: `"uri"`<br/>|yes|
|**includeErrorDescription**|`boolean`|Whether to include an `error_description` property in all error responses. This is meant to assist the client developer in understanding the error. This is NOT meant to be shown to the end user.<br/>Default: `false`<br/>|no|
|**isAccessTokenRevoked**|`Function`|Predicate function that returns true if a jti (JSON Web Token ID) is revoked.<br/>|yes|
|**issuer**|`string`|The authorization server's issuer identifier. It's a URL that uses the "https" scheme and has no query or fragment components. It MUST also be a prefix of the indieauth-metadata URL.<br/>Format: `"uri"`<br/>|yes|
|[**jwks**](#jwks)|`object`|Private JSON Web Key Set (JWKS). The access token issued by this token endpoint will be signed using a JWK randomly chosen from this set.<br/>|yes|
|**logPrefix**|`string`|Default: `"[token-endpoint] "`<br/>|no|
|**onIssuedTokens**|`Function`|Handler invoked when the token endpoint has issued an access token and a refresh token. You should use this handler to persist the tokens to some storage (e.g. a database).<br/>|yes|
|**refreshTokenExpiration**<br/>(Token expiration)|`string`|Human-readable expiration time for the token issued by the token endpoint.<br/>Default: `"30 days"`<br/>Minimal Length: `1`<br/>|no|
|**reportAllAjvErrors**<br/>(report all AJV errors)|`boolean`|Whether to report all AJV validation errors.<br/>Default: `false`<br/>|no|
|**retrieveRefreshToken**|`Function`|Function that retrieves a refresh token from a storage backend.<br/>|yes|
|**revocationEndpoint**<br/>(Revocation endpoint)|`string`|URL of the authorization server's OAuth 2.0 revocation endpoint.<br/>Format: `"uri"`<br/>|yes|
|**userinfoEndpoint**<br/>(Userinfo endpoint)|`string`|Format: `"uri"`<br/>|yes|

**Example**

```json
{
    "accessTokenExpiration": "60 seconds",
    "includeErrorDescription": false,
    "jwks": {
        "keys": [
            {}
        ]
    },
    "logPrefix": "[token-endpoint] ",
    "refreshTokenExpiration": "60 seconds",
    "reportAllAjvErrors": false
}
```

<a name="jwks"></a>
### jwks: object

Private JSON Web Key Set (JWKS). The access token issued by this token endpoint will be signed using a JWK randomly chosen from this set.

**Properties**

|Name|Type|Description|Required|
|----|----|-----------|--------|
|[**keys**](#jwkskeys)|`object[]`||yes|

**Example**

```json
{
    "keys": [
        {}
    ]
}
```

<a name="jwkskeys"></a>
#### jwks\.keys\[\]: array

**Items**

**Item Properties**

|Name|Type|Description|Required|
|----|----|-----------|--------|
|**alg**|`string`|Minimal Length: `1`<br/>|no|
|**d**|`string`|Minimal Length: `1`<br/>|no|
|**dp**|`string`|Minimal Length: `1`<br/>|no|
|**dq**|`string`|Minimal Length: `1`<br/>|no|
|**e**|`string`|Minimal Length: `1`<br/>|no|
|**kid**|`string`|Minimal Length: `1`<br/>|no|
|**kty**|`string`|Minimal Length: `1`<br/>|yes|
|**n**|`string`|Minimal Length: `1`<br/>|no|
|**p**|`string`|Minimal Length: `1`<br/>|no|
|**q**|`string`|Minimal Length: `1`<br/>|no|
|**qi**|`string`|Minimal Length: `1`<br/>|no|

**Example**

```json
[
    {}
]
```

## Access tokens

The [access tokens](https://datatracker.ietf.org/doc/html/rfc6749#section-1.4) issued by the token endpoint implemented by this plugin are JSON Web Tokens.

Each JWT issued by this token endpoint is **signed** with RS256 using a random [JSON Web Key (JWK)](https://datatracker.ietf.org/doc/html/rfc7517) from a given **private** [JWK Set](https://datatracker.ietf.org/doc/html/rfc7517#section-5).

Each JWT issued by this token endpoint can be **verified** by anyone (for example by a [revocation endpoint](https://www.rfc-editor.org/rfc/rfc7009) or an [introspection endpoint](https://datatracker.ietf.org/doc/html/rfc7662)) using the [the `kid` parameter](https://datatracker.ietf.org/doc/html/rfc7517#section-4.5) from the matching **public** JWK Set.

> [!WARNING]
> Since neither OAuth 2.0 nor IndieAuth require an access token to be implemented as a JSON Web Token, I am considering other implementations. Watch the talk [Rethinking Authentication](https://youtu.be/VhRbvTdX9Ug?si=nvl3HvbzzdTPCght) to learn more about possible alternative implementations for access tokens.

## Refresh tokens

The [refresh tokens](https://indieauth.spec.indieweb.org/#refresh-tokens) issued by the token endpoint implemented by this plugin are [Nano IDs](https://zelark.github.io/nano-id-cc/) generated with [nanoid](https://github.com/ai/nanoid).

> [!TIP]
> Read the article [Why we chose NanoIDs for PlanetScale’s API](https://planetscale.com/blog/why-we-chose-nanoids-for-planetscales-api) for a comparison of Nano ID with UUIDs.

## User-provided functions

You need to implement the following **asynchronous** functions:

- `isAccessTokenRevoked`
- `onIssuedTokens`
- `retrieveRefreshToken`

### `isAccessTokenRevoked`

Predicate function that will be called to check whether a previously issued token is revoked or not.

### `onIssuedTokens`

Handler invoked when the token endpoint has issued an access token and a refresh token. You should use this handler to persist the tokens to some storage (e.g. a database).

The function accepts a single parameter, an object containing an access token, a refresh token, and few other properties about the issuer, the client application and the end-user.

##### Tokens Plus Info

Access token, refresh token, and some additional information about the issuer, the client, and the end-user.

**Properties**

|Name|Type|Description|Required|
|----|----|-----------|--------|
|**access\_token**|`string`|Minimal Length: `1`<br/>|yes|
|**access\_token\_expires\_in**|`number`|Minimum: `1`<br/>|yes|
|**client\_id**|`string`|The ID of the application that asks for authorization. An IndieAuth client ID is a URL.<br/>Format: `"uri"`<br/>|yes|
|**issuer**|`string`|The authorization server's issuer identifier. It's a URL that uses the "https" scheme and has no query or fragment components. It MUST also be a prefix of the indieauth-metadata URL.<br/>Format: `"uri"`<br/>|yes|
|**jti**<br/>("jti" \(JWT ID\) Claim)|`string`|Unique identifier for the JWT<br/>Minimal Length: `1`<br/>|yes|
|**kid**|`string`|Minimal Length: `1`<br/>|yes|
|**me**<br/>(me \(canonicalized\))|`string`|Profile URL (after URL Canonicalization)<br/>Format: `"uri"`<br/>|yes|
|**redirect\_uri**|`string`|Holds a URL. A successful response from this endpoint results in a redirect to this URL.<br/>Format: `"uri"`<br/>|yes|
|**refresh\_token**|`string`|Minimal Length: `1`<br/>|yes|
|**refresh\_token\_expires\_at**<br/>("exp" \(Expiration Time\) Claim)|`number`|UNIX timestamp when the JWT expires<br/>Minimum: `0`<br/>|yes|
|**scope**<br/>(OAuth 2\.0 scope \(scopes\) claim)|`string`|Scope values. See [RFC8693 scope claim](https://www.rfc-editor.org/rfc/rfc8693.html#name-scope-scopes-claim)<br/>Minimal Length: `1`<br/>|yes|

**Additional Properties:** not allowed  

### `retrieveRefreshToken`

Function that retrieves a refresh token from a storage backend.

## Dependencies

| Package | Version |
|---|---|
| [@fastify/formbody](https://www.npmjs.com/package/@fastify/formbody) | `^8.0.2` |
| [@fastify/response-validation](https://www.npmjs.com/package/@fastify/response-validation) | `^3.0.3` |
| [@jackdbd/fastify-utils](https://www.npmjs.com/package/@jackdbd/fastify-utils) | `*` |
| [@jackdbd/indieauth](https://www.npmjs.com/package/@jackdbd/indieauth) | `^0.1.1-canary.0` |
| [@jackdbd/oauth2](https://www.npmjs.com/package/@jackdbd/oauth2) | `^0.1.0` |
| [@jackdbd/oauth2-error-responses](https://www.npmjs.com/package/@jackdbd/oauth2-error-responses) | `^0.1.1-canary.0` |
| [@jackdbd/oauth2-tokens](https://www.npmjs.com/package/@jackdbd/oauth2-tokens) | `^0.1.1-canary.4` |
| [@jackdbd/schema-validators](https://www.npmjs.com/package/@jackdbd/schema-validators) | `^0.1.1-canary.0` |
| [@sinclair/typebox](https://www.npmjs.com/package/@sinclair/typebox) | `^0.34.14` |
| [ajv](https://www.npmjs.com/package/ajv) | `^8.17.1` |
| [ajv-formats](https://www.npmjs.com/package/ajv-formats) | `^3.0.1` |
| [fastify-plugin](https://www.npmjs.com/package/fastify-plugin) | `^5.0.1` |

> ⚠️ **Peer Dependencies**
>
> This package defines 1 peer dependency.

| Peer | Version range |
|---|---|
| `fastify` | `>=5.0.0` |

## References

- [Issuing an Access Token - The OAuth 2.0 Authorization Framework (RFC 6749)](https://datatracker.ietf.org/doc/html/rfc6749#section-5)
- [Refreshing an Access Token - The OAuth 2.0 Authorization Framework (RFC 6749)](https://datatracker.ietf.org/doc/html/rfc6749#section-6)
- [Access Token Response - IndieAuth](https://indieauth.spec.indieweb.org/#access-token-response)
- [IndieAuth Rocks! (validator for testing IndieAuth client and server implementations)](https://indieauth.rocks/)
- [IndieAuth scopes](https://indieweb.org/scope#IndieAuth_Scopes): `email`, `profile`
- [Micropub scopes](https://indieweb.org/scope#Microsub_Scopes): `create`, `update`, `delete`, `undelete`, `draft`, `media`

## License

&copy; 2024 - 2025 [Giacomo Debidda](https://www.giacomodebidda.com/) // [MIT License](https://spdx.org/licenses/MIT.html)
