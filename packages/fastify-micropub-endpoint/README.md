# @jackdbd/fastify-micropub-endpoint

[![npm version](https://badge.fury.io/js/@jackdbd%2Ffastify-micropub-endpoint.svg)](https://badge.fury.io/js/@jackdbd%2Ffastify-micropub-endpoint)
[![install size](https://packagephobia.com/badge?p=@jackdbd/fastify-micropub-endpoint)](https://packagephobia.com/result?p=@jackdbd/fastify-micropub-endpoint)
[![CodeCov badge](https://codecov.io/gh/jackdbd/rapido/graph/badge.svg?token=BpFF8tmBYS)](https://app.codecov.io/gh/jackdbd/rapido?flags%5B0%5D=fastify-micropub-endpoint)
[![Socket Badge](https://socket.dev/api/badge/npm/package/@jackdbd/fastify-micropub-endpoint)](https://socket.dev/npm/package/@jackdbd/fastify-micropub-endpoint)

Fastify plugin that adds a [Micropub endpoint](https://www.w3.org/TR/micropub/) to a Fastify server.

- [Installation](#installation)
- [Micropub Endpoint Options](#micropub-endpoint-options)
  - [syndicateTo\[\]: array](#syndicateto-array)
    - [syndicateTo\[\]\.service: object](#syndicatetoservice-object)
    - [syndicateTo\[\]\.user: object](#syndicatetouser-object)
- [Dependencies](#dependencies)
- [References](#references)
- [License](#license)

## Installation

```sh
npm install @jackdbd/fastify-micropub-endpoint
```

## Micropub Endpoint Options

Options for the Fastify micropub-endpoint plugin

**Properties**

|Name|Type|Description|Required|
|----|----|-----------|--------|
|**ajv**||Instance of Ajv<br/>|no|
|**create**<br/>(Create post)|`Function`|[Creates](https://micropub.spec.indieweb.org/#create) a post on the Micropub server.<br/>|yes|
|**delete**<br/>(Delete post)|`Function`|[Deletes](https://micropub.spec.indieweb.org/#delete) a post published at a URL.<br/>|yes|
|**includeErrorDescription**|`boolean`|Default: `false`<br/>|no|
|**isAccessTokenRevoked**|`Function`|Predicate function that returns true if a jti (JSON Web Token ID) is revoked.<br/>|yes|
|**logPrefix**|`string`|Default: `"[micropub-endpoint] "`<br/>|no|
|**me**|||yes|
|**mediaEndpoint**<br/>(Media endpoint)|`string`|Format: `"uri"`<br/>|no|
|**micropubEndpoint**<br/>(Micropub endpoint)|`string`|Format: `"uri"`<br/>|no|
|**multipartFormDataMaxFileSize**<br/>(multipart/form\-data max file size)|`number`|Max file size (in bytes) for multipart/form-data requests.<br/>Default: `10000000`<br/>Minimum: `0`<br/>|no|
|**reportAllAjvErrors**<br/>(report all AJV errors)|`boolean`|Whether to report all AJV validation errors.<br/>Default: `false`<br/>|no|
|[**syndicateTo**](#syndicateto)|`object[]`|Default: <br/>|no|
|**undelete**<br/>(Undelete post)|`Function`|[Undeletes](https://micropub.spec.indieweb.org/#delete) a post published at a URL.<br/>|no|
|**update**<br/>(Update post)|`Function`|[Updates](https://micropub.spec.indieweb.org/#update) a post published at a URL.<br/>|yes|

**Example**

```json
{
    "includeErrorDescription": false,
    "logPrefix": "[micropub-endpoint] ",
    "multipartFormDataMaxFileSize": 10000000,
    "reportAllAjvErrors": false,
    "syndicateTo": []
}
```

<a name="syndicateto"></a>
### syndicateTo\[\]: array

**Items**

**Item Properties**

|Name|Type|Description|Required|
|----|----|-----------|--------|
|**uid**|`string`||yes|
|**name**|`string`||yes|
|[**service**](#syndicatetoservice)|`object`||yes|
|[**user**](#syndicatetouser)|`object`||yes|

<a name="syndicatetoservice"></a>
#### syndicateTo\[\]\.service: object

**Properties**

|Name|Type|Description|Required|
|----|----|-----------|--------|
|**name**|`string`||yes|
|**url**|`string`||yes|
|**photo**|`string`||no|

<a name="syndicatetouser"></a>
#### syndicateTo\[\]\.user: object

**Properties**

|Name|Type|Description|Required|
|----|----|-----------|--------|
|**name**|`string`||yes|
|**url**|`string`||yes|
|**photo**|`string`||no|

## Dependencies

| Package | Version |
|---|---|
| [@fastify/formbody](https://www.npmjs.com/package/@fastify/formbody) | `^8.0.2` |
| [@fastify/multipart](https://www.npmjs.com/package/@fastify/multipart) | `^9.0.3` |
| [@fastify/response-validation](https://www.npmjs.com/package/@fastify/response-validation) | `^3.0.3` |
| [@jackdbd/canonical-url](https://www.npmjs.com/package/@jackdbd/canonical-url) | `0.2.0-canary.7` |
| [@jackdbd/fastify-hooks](https://www.npmjs.com/package/@jackdbd/fastify-hooks) | `0.2.0-canary.10` |
| [@jackdbd/fastify-utils](https://www.npmjs.com/package/@jackdbd/fastify-utils) | `0.2.0-canary.9` |
| [@jackdbd/indieauth](https://www.npmjs.com/package/@jackdbd/indieauth) | `*` |
| [@jackdbd/microformats2](https://www.npmjs.com/package/@jackdbd/microformats2) | `0.2.0-canary.7` |
| [@jackdbd/micropub](https://www.npmjs.com/package/@jackdbd/micropub) | `0.2.0-canary.9` |
| [@jackdbd/oauth2-error-responses](https://www.npmjs.com/package/@jackdbd/oauth2-error-responses) | `0.2.0-canary.7` |
| [@jackdbd/schema-validators](https://www.npmjs.com/package/@jackdbd/schema-validators) | `^0.2.0-canary.10` |
| [@paulrobertlloyd/mf2tojf2](https://www.npmjs.com/package/@paulrobertlloyd/mf2tojf2) | `^2.4.0` |
| [@sinclair/typebox](https://www.npmjs.com/package/@sinclair/typebox) | `^0.34.14` |
| [ajv](https://www.npmjs.com/package/ajv) | `^8.17.1` |
| [ajv-formats](https://www.npmjs.com/package/ajv-formats) | `^3.0.1` |
| [fastify-plugin](https://www.npmjs.com/package/fastify-plugin) | `^5.0.1` |
| [form-auto-content](https://www.npmjs.com/package/form-auto-content) | `^3.2.1` |

> ⚠️ **Peer Dependencies**
>
> This package defines 2 peer dependencies.

| Peer | Version range |
|---|---|
| `@fastify/request-context` | `>=6.0.0` |
| `fastify` | `>=5.0.0` |

## References

- [Micropub endpoint (indieweb.org)](https://indieweb.org/micropub-endpoint)

## License

&copy; 2024 - 2025 [Giacomo Debidda](https://www.giacomodebidda.com/) // [MIT License](https://spdx.org/licenses/MIT.html)
