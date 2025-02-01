# @jackdbd/fastify-revocation-endpoint

[![npm version](https://badge.fury.io/js/@jackdbd%2Ffastify-revocation-endpoint.svg)](https://badge.fury.io/js/@jackdbd%2Ffastify-revocation-endpoint)
[![install size](https://packagephobia.com/badge?p=@jackdbd/fastify-revocation-endpoint)](https://packagephobia.com/result?p=@jackdbd/fastify-revocation-endpoint)
[![CodeCov badge](https://codecov.io/gh/jackdbd/rapido/graph/badge.svg?token=BpFF8tmBYS)](https://app.codecov.io/gh/jackdbd/rapido?flags%5B0%5D=fastify-revocation-endpoint)
[![Socket Badge](https://socket.dev/api/badge/npm/package/@jackdbd/fastify-revocation-endpoint)](https://socket.dev/npm/package/@jackdbd/fastify-revocation-endpoint)

Fastify plugin that adds an [IndieAuth Token Revocation endpoint](https://indieauth.spec.indieweb.org/#token-revocation) to a Fastify server.

- [Installation](#installation)
- [Revocation Endpoint Options](#revocation-endpoint-options)
  - [jwksUrl: JWKS public URL](#jwksurl-jwks-public-url)
- [Dependencies](#dependencies)
- [References](#references)
- [License](#license)

## Installation

```sh
npm install @jackdbd/fastify-revocation-endpoint
```

## Revocation Endpoint Options

Options for the Fastify revocation-endpoint plugin

**Properties**

|Name|Type|Description|Required|
|----|----|-----------|--------|
|**ajv**||Instance of Ajv<br/>|no|
|**includeErrorDescription**|`boolean`|Whether to include an `error_description` property in all error responses. This is meant to assist the client developer in understanding the error. This is NOT meant to be shown to the end user.<br/>Default: `false`<br/>|no|
|**isAccessTokenRevoked**|`Function`|Predicate function that returns true if a jti (JSON Web Token ID) is revoked.<br/>|yes|
|**issuer**|`string`|The authorization server's issuer identifier. It's a URL that uses the "https" scheme and has no query or fragment components. It MUST also be a prefix of the indieauth-metadata URL.<br/>Format: `"uri"`<br/>|yes|
|[**jwksUrl**](#jwksurl)<br/>(JWKS public URL)|`object`|URL where the public JSON Web Key Set is hosted.<br/>|yes|
|**logPrefix**|`string`|Default: `"revocation-endpoint "`<br/>|no|
|**maxAccessTokenAge**|`string`|Minimal Length: `1`<br/>|no|
|**me**|||yes|
|**reportAllAjvErrors**<br/>(report all AJV errors)|`boolean`|Whether to report all AJV validation errors.<br/>Default: `false`<br/>|no|
|**retrieveAccessToken**|`Function`|Function that retrieves an access token from a storage backend.<br/>|yes|
|**retrieveRefreshToken**|`Function`|Function that retrieves a refresh token from a storage backend.<br/>|yes|
|**revokeAccessToken**|`Function`|Handler invoked when the token revocation endpoint has met all requirements to revoke a token. You should use it to mark the access token as revoked in your storage backend.<br/>|yes|
|**revokeRefreshToken**|`Function`|Handler invoked when the token revocation endpoint has met all requirements to revoke a token. You should use it to mark the refresh token as revoked in your storage backend.<br/>|yes|

**Example**

```json
{
    "includeErrorDescription": false,
    "jwksUrl": {},
    "logPrefix": "revocation-endpoint ",
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
| [@jackdbd/canonical-url](https://www.npmjs.com/package/@jackdbd/canonical-url) | `0.1.1-canary.0` |
| [@jackdbd/fastify-hooks](https://www.npmjs.com/package/@jackdbd/fastify-hooks) | `*` |
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

- [OAuth 2.0 Token Revocation (RFC 7009)](https://www.rfc-editor.org/rfc/rfc7009.html)
- [Token revocation on OAuth.net](https://oauth.net/2/token-revocation/)

## License

&copy; 2024 - 2025 [Giacomo Debidda](https://www.giacomodebidda.com/) // [MIT License](https://spdx.org/licenses/MIT.html)
