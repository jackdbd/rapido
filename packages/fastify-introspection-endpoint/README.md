# @jackdbd/fastify-introspection-endpoint

[![npm version](https://badge.fury.io/js/@jackdbd%2Ffastify-introspection-endpoint.svg)](https://badge.fury.io/js/@jackdbd%2Ffastify-introspection-endpoint)
[![install size](https://packagephobia.com/badge?p=@jackdbd/fastify-introspection-endpoint)](https://packagephobia.com/result?p=@jackdbd/fastify-introspection-endpoint)
[![CodeCov badge](https://codecov.io/gh/jackdbd/rapido/graph/badge.svg?token=BpFF8tmBYS)](https://app.codecov.io/gh/jackdbd/rapido?flags%5B0%5D=fastify-introspection-endpoint)
[![Socket Badge](https://socket.dev/api/badge/npm/package/@jackdbd/fastify-introspection-endpoint)](https://socket.dev/npm/package/@jackdbd/fastify-introspection-endpoint)

Fastify plugin that adds an [IndieAuth Token Introspection Endpoint](https://indieauth.spec.indieweb.org/#access-token-verification) to a Fastify server.

IndieAuth extends OAuth 2.0 Token Introspection by adding that the introspection response MUST include an additional parameter, `me`.

- [Installation](#installation)
- [Introspection Endpoint Options](#introspection-endpoint-options)
  - [jwksUrl: JWKS public URL](#jwksurl-jwks-public-url)
- [Dependencies](#dependencies)
- [References](#references)
- [License](#license)

## Installation

```sh
npm install @jackdbd/fastify-introspection-endpoint
```

## Introspection Endpoint Options

Options for the Fastify introspection-endpoint plugin

**Properties**

|Name|Type|Description|Required|
|----|----|-----------|--------|
|**ajv**||Instance of Ajv<br/>|no|
|**includeErrorDescription**|`boolean`|Whether to include an `error_description` property in all error responses. This is meant to assist the client developer in understanding the error. This is NOT meant to be shown to the end user.<br/>Default: `false`<br/>|no|
|**isAccessTokenRevoked**|`Function`|Predicate function that returns true if a jti (JSON Web Token ID) is revoked.<br/>|yes|
|**issuer**|`string`|The authorization server's issuer identifier. It's a URL that uses the "https" scheme and has no query or fragment components. It MUST also be a prefix of the indieauth-metadata URL.<br/>Format: `"uri"`<br/>|yes|
|[**jwksUrl**](#jwksurl)<br/>(JWKS public URL)|`object`|URL where the public JSON Web Key Set is hosted.<br/>|yes|
|**logPrefix**|`string`|Default: `"[introspection-endpoint] "`<br/>|no|
|**me**|||yes|
|**reportAllAjvErrors**<br/>(report all AJV errors)|`boolean`|Whether to report all AJV validation errors.<br/>Default: `false`<br/>|no|
|**retrieveAccessToken**|`Function`|Retrieves an access token from a storage backend.<br/>|yes|
|**retrieveRefreshToken**|`Function`|Retrieves a refresh token from a storage backend.<br/>|yes|

**Example**

```json
{
    "includeErrorDescription": false,
    "jwksUrl": {},
    "logPrefix": "[introspection-endpoint] ",
    "reportAllAjvErrors": false
}
```

<a name="jwksurl"></a>
### jwksUrl: JWKS public URL

URL where the public JSON Web Key Set is hosted.

**Properties**

|Name|Type|Description|Required|
|----|----|-----------|--------|
|**hash**|`string`||yes|
|**host**|`string`||yes|
|**href**|`string`||yes|
|**hostname**|`string`||yes|
|**origin**|`string`||yes|
|**password**|`string`||yes|
|**pathname**|`string`||yes|
|**port**|`string`||yes|
|**protocol**|`string`||yes|
|**search**|`string`||yes|
|**searchParams**|||yes|
|**username**|`string`||yes|
|**toJSON**|||yes|

**Additional Properties:** allowed  

## Dependencies

| Package | Version |
|---|---|
| [@fastify/formbody](https://www.npmjs.com/package/@fastify/formbody) | `^8.0.2` |
| [@fastify/response-validation](https://www.npmjs.com/package/@fastify/response-validation) | `^3.0.3` |
| [@jackdbd/canonical-url](https://www.npmjs.com/package/@jackdbd/canonical-url) | `0.2.0-canary.8` |
| [@jackdbd/fastify-hooks](https://www.npmjs.com/package/@jackdbd/fastify-hooks) | `0.2.0-canary.12` |
| [@jackdbd/indieauth](https://www.npmjs.com/package/@jackdbd/indieauth) | `0.2.0-canary.11` |
| [@jackdbd/oauth2-error-responses](https://www.npmjs.com/package/@jackdbd/oauth2-error-responses) | `^0.2.0-canary.8` |
| [@jackdbd/schema-validators](https://www.npmjs.com/package/@jackdbd/schema-validators) | `^0.2.0-canary.11` |
| [@sinclair/typebox](https://www.npmjs.com/package/@sinclair/typebox) | `^0.34.14` |
| [ajv](https://www.npmjs.com/package/ajv) | `^8.17.1` |
| [ajv-formats](https://www.npmjs.com/package/ajv-formats) | `^3.0.1` |
| [fastify-plugin](https://www.npmjs.com/package/fastify-plugin) | `^5.0.1` |

> [!WARNING]
> This package defines 2 peer dependencies.

| Peer | Version range |
|---|---|
| `@fastify/request-context` | `>=6.0.0` |
| `fastify` | `>=5.0.0` |

## References

- [OAuth 2.0 Token Introspection (RFC 7662)](https://www.rfc-editor.org/rfc/rfc7662)
- [Access Token Verification Request - IndieAuth](https://indieauth.spec.indieweb.org/#access-token-verification-request)
- [Access Token Verification Response - IndieAuth](https://indieauth.spec.indieweb.org/#access-token-verification-response)
- [Introspection Request - OAuth 2.0 Token Introspection](https://www.rfc-editor.org/rfc/rfc7662#section-2.1)
- [Introspection Response - OAuth 2.0 Token Introspection](https://www.rfc-editor.org/rfc/rfc7662#section-2.2)

## License

&copy; 2024 - 2025 [Giacomo Debidda](https://www.giacomodebidda.com/) // [MIT License](https://spdx.org/licenses/MIT.html)
