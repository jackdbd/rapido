# @jackdbd/fastify-syndicate-endpoint

[![npm version](https://badge.fury.io/js/@jackdbd%2Ffastify-syndicate-endpoint.svg)](https://badge.fury.io/js/@jackdbd%2Ffastify-syndicate-endpoint)
[![install size](https://packagephobia.com/badge?p=@jackdbd/fastify-syndicate-endpoint)](https://packagephobia.com/result?p=@jackdbd/fastify-syndicate-endpoint)
[![CodeCov badge](https://codecov.io/gh/jackdbd/rapido/graph/badge.svg?token=BpFF8tmBYS)](https://app.codecov.io/gh/jackdbd/rapido?flags%5B0%5D=fastify-syndicate-endpoint)
[![Socket Badge](https://socket.dev/api/badge/npm/package/@jackdbd/fastify-syndicate-endpoint)](https://socket.dev/npm/package/@jackdbd/fastify-syndicate-endpoint)

Fastify plugin that adds a `syndicate` endpoint to a Fastify server.

This endpoint manages the [syndication (aka cross-posting)](https://indieweb.org/Category:syndication) of content/media to the [syndication targets](https://micropub.spec.indieweb.org/#syndication-targets) supported by a Micropub server.

- [Installation](#installation)
- [Syndicate Endpoint Options](#syndicate-endpoint-options)
- [Dependencies](#dependencies)
- [References](#references)
- [License](#license)

## Installation

```sh
npm install @jackdbd/fastify-syndicate-endpoint
```

## Syndicate Endpoint Options

Options for the Fastify syndicate-endpoint plugin

**Properties**

|Name|Type|Description|Required|
|----|----|-----------|--------|
|**ajv**||Instance of Ajv<br/>|no|
|**includeErrorDescription**|`boolean`|Whether to include an `error_description` property in all error responses. This is meant to assist the client developer in understanding the error. This is NOT meant to be shown to the end user.<br/>Default: `false`<br/>|no|
|**isAccessTokenRevoked**|`Function`|Predicate function that returns true if a jti (JSON Web Token ID) is revoked.<br/>|yes|
|**logPrefix**|`string`|Default: `"[syndicate-endpoint] "`<br/>|no|
|**me**|||yes|
|**websiteUrlToStoreLocation**<br/>(Website URL to store location)|`Function`|Maps a URL published on the user's website to a location on the user's store (e.g. a table in a database, a path in a git repository, a URL in a public bucket of an object storage service like AWS S3).<br/>|yes|
|**reportAllAjvErrors**<br/>(report all AJV errors)|`boolean`|Whether to report all AJV validation errors.<br/>Default: `false`<br/>|no|
|**retrievePost**<br/>(retrieveContent)|`Function`|Retrieves a post from the Micropub server.<br/>|yes|
|**syndicators**|||yes|
|**updatePost**<br/>(Update post)|`Function`|[Updates](https://micropub.spec.indieweb.org/#update) a post published at a URL.<br/>|yes|

**Example**

```json
{
    "includeErrorDescription": false,
    "logPrefix": "[syndicate-endpoint] ",
    "reportAllAjvErrors": false
}
```

## Dependencies

| Package | Version |
|---|---|
| [@fastify/formbody](https://www.npmjs.com/package/@fastify/formbody) | `^8.0.2` |
| [@fastify/response-validation](https://www.npmjs.com/package/@fastify/response-validation) | `^3.0.3` |
| [@jackdbd/canonical-url](https://www.npmjs.com/package/@jackdbd/canonical-url) | `0.2.0-canary.8` |
| [@jackdbd/fastify-hooks](https://www.npmjs.com/package/@jackdbd/fastify-hooks) | `0.2.0-canary.15` |
| [@jackdbd/indieauth](https://www.npmjs.com/package/@jackdbd/indieauth) | `0.2.0-canary.13` |
| [@jackdbd/micropub](https://www.npmjs.com/package/@jackdbd/micropub) | `0.2.0-canary.12` |
| [@jackdbd/oauth2-error-responses](https://www.npmjs.com/package/@jackdbd/oauth2-error-responses) | `0.2.0-canary.9` |
| [@paulrobertlloyd/mf2tojf2](https://www.npmjs.com/package/@paulrobertlloyd/mf2tojf2) | `^2.4.0` |
| [@sinclair/typebox](https://www.npmjs.com/package/@sinclair/typebox) | `^0.34.15` |
| [ajv](https://www.npmjs.com/package/ajv) | `^8.17.1` |
| [ajv-formats](https://www.npmjs.com/package/ajv-formats) | `^3.0.1` |
| [fast-xml-parser](https://www.npmjs.com/package/fast-xml-parser) | `^4.5.1` |
| [fastify-plugin](https://www.npmjs.com/package/fastify-plugin) | `^5.0.1` |

> [!WARNING]
> This package defines 2 peer dependencies.

| Peer | Version range |
|---|---|
| `@fastify/request-context` | `>=6.0.0` |
| `fastify` | `>=5.0.0` |

## References

- [POSSE (indieweb.org)](https://indieweb.org/POSSE)
- [syndication-brainstorming (indieweb.org)](https://indieweb.org/syndication-brainstorming)

## License

&copy; 2024 - 2025 [Giacomo Debidda](https://www.giacomodebidda.com/) // [MIT License](https://spdx.org/licenses/MIT.html)
