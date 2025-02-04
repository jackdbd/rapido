# @jackdbd/fastify-userinfo-endpoint

[![npm version](https://badge.fury.io/js/@jackdbd%2Ffastify-userinfo-endpoint.svg)](https://badge.fury.io/js/@jackdbd%2Ffastify-userinfo-endpoint)
[![install size](https://packagephobia.com/badge?p=@jackdbd/fastify-userinfo-endpoint)](https://packagephobia.com/result?p=@jackdbd/fastify-userinfo-endpoint)
[![CodeCov badge](https://codecov.io/gh/jackdbd/rapido/graph/badge.svg?token=BpFF8tmBYS)](https://app.codecov.io/gh/jackdbd/rapido?flags%5B0%5D=fastify-userinfo-endpoint)
[![Socket Badge](https://socket.dev/api/badge/npm/package/@jackdbd/fastify-userinfo-endpoint)](https://socket.dev/npm/package/@jackdbd/fastify-userinfo-endpoint)

Fastify plugin that adds a [IndieAuth Userinfo Endpoint](https://indieauth.spec.indieweb.org/#user-information) to a Fastify server.

- [Installation](#installation)
- [Userinfo Endpoint Options](#userinfo-endpoint-options)
- [Dependencies](#dependencies)
- [References](#references)
- [License](#license)

## Installation

```sh
npm install @jackdbd/fastify-userinfo-endpoint
```

## Userinfo Endpoint Options

Options for the Fastify userinfo-endpoint plugin

**Properties**

|Name|Type|Description|Required|
|----|----|-----------|--------|
|**ajv**||Instance of Ajv<br/>|no|
|**includeErrorDescription**|`boolean`|Whether to include an `error_description` property in all error responses. This is meant to assist the client developer in understanding the error. This is NOT meant to be shown to the end user.<br/>Default: `false`<br/>|no|
|**isAccessTokenRevoked**|`Function`|Predicate function that returns true if a jti (JSON Web Token ID) is revoked.<br/>|yes|
|**logPrefix**|`string`|Default: `"[userinfo-endpoint] "`<br/>|no|
|**reportAllAjvErrors**<br/>(report all AJV errors)|`boolean`|Whether to report all AJV validation errors.<br/>Default: `false`<br/>|no|
|**requestContextKey**|`string`|The key under which the access token claims are stored in the request context.<br/>Default: `"access_token_claims"`<br/>Minimal Length: `1`<br/>|no|
|**retrieveUserProfile**|`Function`|Function that retrieves a user's profile from a storage backend.<br/>|yes|

**Example**

```json
{
    "includeErrorDescription": false,
    "logPrefix": "[userinfo-endpoint] ",
    "reportAllAjvErrors": false,
    "requestContextKey": "access_token_claims"
}
```

## Dependencies

| Package | Version |
|---|---|
| [@fastify/response-validation](https://www.npmjs.com/package/@fastify/response-validation) | `^3.0.3` |
| [@jackdbd/canonical-url](https://www.npmjs.com/package/@jackdbd/canonical-url) | `0.2.0-canary.4` |
| [@jackdbd/fastify-hooks](https://www.npmjs.com/package/@jackdbd/fastify-hooks) | `0.2.0-canary.7` |
| [@jackdbd/fastify-utils](https://www.npmjs.com/package/@jackdbd/fastify-utils) | `0.2.0-canary.6` |
| [@jackdbd/indieauth](https://www.npmjs.com/package/@jackdbd/indieauth) | `^0.2.0-canary.4` |
| [@jackdbd/oauth2](https://www.npmjs.com/package/@jackdbd/oauth2) | `^0.2.0-canary.3` |
| [@jackdbd/oauth2-error-responses](https://www.npmjs.com/package/@jackdbd/oauth2-error-responses) | `^0.2.0-canary.4` |
| [@jackdbd/oauth2-tokens](https://www.npmjs.com/package/@jackdbd/oauth2-tokens) | `^0.2.0-canary.8` |
| [@jackdbd/schema-validators](https://www.npmjs.com/package/@jackdbd/schema-validators) | `^0.2.0-canary.7` |
| [@sinclair/typebox](https://www.npmjs.com/package/@sinclair/typebox) | `^0.34.14` |
| [ajv](https://www.npmjs.com/package/ajv) | `^8.17.1` |
| [ajv-formats](https://www.npmjs.com/package/ajv-formats) | `^3.0.1` |
| [fastify-plugin](https://www.npmjs.com/package/fastify-plugin) | `^5.0.1` |

> ⚠️ **Peer Dependencies**
>
> This package defines 2 peer dependencies.

| Peer | Version range |
|---|---|
| `@fastify/request-context` | `>=6.0.0` |
| `fastify` | `>=5.0.0` |

## References

- [Profile Information - IndieAuth](https://indieauth.spec.indieweb.org/#x5-3-4-profile-information)
- [Verifying the User Info (oauth.com)](https://www.oauth.com/oauth2-servers/signing-in-with-google/verifying-the-user-info/)
- [UserInfo - Retrieving details about the logged-in user (connect2id.com)](https://connect2id.com/products/server/docs/api/userinfo)

## License

&copy; 2024 - 2025 [Giacomo Debidda](https://www.giacomodebidda.com/) // [MIT License](https://spdx.org/licenses/MIT.html)
