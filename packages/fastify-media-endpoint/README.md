# @jackdbd/fastify-media-endpoint

[![npm version](https://badge.fury.io/js/@jackdbd%2Ffastify-media-endpoint.svg)](https://badge.fury.io/js/@jackdbd%2Ffastify-media-endpoint)
[![install size](https://packagephobia.com/badge?p=@jackdbd/fastify-media-endpoint)](https://packagephobia.com/result?p=@jackdbd/fastify-media-endpoint)
[![CodeCov badge](https://codecov.io/gh/jackdbd/rapido/graph/badge.svg?token=BpFF8tmBYS)](https://app.codecov.io/gh/jackdbd/rapido?flags%5B0%5D=fastify-media-endpoint)
[![Socket Badge](https://socket.dev/api/badge/npm/package/@jackdbd/fastify-media-endpoint)](https://socket.dev/npm/package/@jackdbd/fastify-media-endpoint)

Fastify plugin that adds a [Micropub Media endpoint](https://www.w3.org/TR/micropub/#media-endpoint) to a Fastify server.

- [Installation](#installation)
- [Fastify plugin media\-endpoint options](#fastify-plugin-media-endpoint-options)
- [Dependencies](#dependencies)
- [References](#references)
- [License](#license)

## Installation

```sh
npm install @jackdbd/fastify-media-endpoint
```

## Fastify plugin media\-endpoint options

Options for the Fastify media-endpoint plugin

**Properties**

|Name|Type|Description|Required|
|----|----|-----------|--------|
|**ajv**||Instance of Ajv<br/>|no|
|**delete**|`Function`|[Deletes](https://micropub.spec.indieweb.org/#delete) a file from the Micropub server.<br/>|yes|
|**includeErrorDescription**|`boolean`|Whether to include an `error_description` property in all error responses. This is meant to assist the client developer in understanding the error. This is NOT meant to be shown to the end user.<br/>Default: `false`<br/>|no|
|**isAccessTokenRevoked**|`Function`|Predicate function that returns true if a jti (JSON Web Token ID) is revoked.<br/>|yes|
|**logPrefix**|`string`|Default: `"[media-endpoint] "`<br/>|no|
|**me**|||yes|
|**multipartFormDataMaxFileSize**<br/>(multipart/form\-data max file size)|`number`|Max file size (in bytes) for multipart/form-data requests.<br/>Default: `10000000`<br/>Minimum: `0`<br/>|no|
|**reportAllAjvErrors**<br/>(report all AJV errors)|`boolean`|Whether to report all AJV validation errors.<br/>Default: `false`<br/>|no|
|**upload**|`Function`|[Uploads a file](https://micropub.spec.indieweb.org/#uploading-files) to the Micropub server.<br/>|yes|

**Example**

```json
{
    "includeErrorDescription": false,
    "logPrefix": "[media-endpoint] ",
    "multipartFormDataMaxFileSize": 10000000,
    "reportAllAjvErrors": false
}
```

## Dependencies

| Package | Version |
|---|---|
| [@fastify/multipart](https://www.npmjs.com/package/@fastify/multipart) | `^9.0.3` |
| [@fastify/request-context](https://www.npmjs.com/package/@fastify/request-context) | `^6.0.2` |
| [@fastify/response-validation](https://www.npmjs.com/package/@fastify/response-validation) | `^3.0.3` |
| [@jackdbd/canonical-url](https://www.npmjs.com/package/@jackdbd/canonical-url) | `0.1.1-canary.0` |
| [@jackdbd/indieauth](https://www.npmjs.com/package/@jackdbd/indieauth) | `0.1.1-canary.0` |
| [@jackdbd/micropub](https://www.npmjs.com/package/@jackdbd/micropub) | `0.2.0-canary.1` |
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

- [Micropub media endpoint (indieweb.org)](https://indieweb.org/micropub_media_endpoint)

## License

&copy; 2024 - 2025 [Giacomo Debidda](https://www.giacomodebidda.com/) // [MIT License](https://spdx.org/licenses/MIT.html)
