# @jackdbd/fastify-micropub-endpoint

[![npm version](https://badge.fury.io/js/@jackdbd%2Ffastify-micropub-endpoint.svg)](https://badge.fury.io/js/@jackdbd%2Ffastify-micropub-endpoint)
[![install size](https://packagephobia.com/badge?p=@jackdbd/fastify-micropub-endpoint)](https://packagephobia.com/result?p=@jackdbd/fastify-micropub-endpoint)
[![CodeCov badge](https://codecov.io/gh/jackdbd/rapido/graph/badge.svg?token=BpFF8tmBYS)](https://app.codecov.io/gh/jackdbd/rapido?flags%5B0%5D=fastify-micropub-endpoint)
[![Socket Badge](https://socket.dev/api/badge/npm/package/@jackdbd/fastify-micropub-endpoint)](https://socket.dev/npm/package/@jackdbd/fastify-micropub-endpoint)

Fastify plugin that adds a [Micropub endpoint](https://www.w3.org/TR/micropub/) to a Fastify server.

- [Installation](#installation)
- [Dependencies](#dependencies)
- [References](#references)
- [License](#license)

## Installation

```sh
npm install @jackdbd/fastify-micropub-endpoint
```

{{micropubEndpoint.pluginOptions}}

## Dependencies

| Package | Version |
|---|---|
| [@fastify/formbody](https://www.npmjs.com/package/@fastify/formbody) | `^8.0.2` |
| [@fastify/multipart](https://www.npmjs.com/package/@fastify/multipart) | `^9.0.3` |
| [@fastify/request-context](https://www.npmjs.com/package/@fastify/request-context) | `^6.0.2` |
| [@fastify/response-validation](https://www.npmjs.com/package/@fastify/response-validation) | `^3.0.3` |
| [@jackdbd/canonical-url](https://www.npmjs.com/package/@jackdbd/canonical-url) | `0.1.1-canary.0` |
| [@jackdbd/indieauth](https://www.npmjs.com/package/@jackdbd/indieauth) | `0.1.1-canary.0` |
| [@jackdbd/microformats2](https://www.npmjs.com/package/@jackdbd/microformats2) | `0.1.1-canary.0` |
| [@jackdbd/micropub](https://www.npmjs.com/package/@jackdbd/micropub) | `0.2.0-canary.1` |
| [@jackdbd/oauth2](https://www.npmjs.com/package/@jackdbd/oauth2) | `^0.1.0` |
| [@jackdbd/oauth2-error-responses](https://www.npmjs.com/package/@jackdbd/oauth2-error-responses) | `0.1.1-canary.0` |
| [@jackdbd/oauth2-tokens](https://www.npmjs.com/package/@jackdbd/oauth2-tokens) | `0.1.1-canary.4` |
| [@jackdbd/schema-validators](https://www.npmjs.com/package/@jackdbd/schema-validators) | `^0.1.1-canary.0` |
| [@paulrobertlloyd/mf2tojf2](https://www.npmjs.com/package/@paulrobertlloyd/mf2tojf2) | `^2.4.0` |
| [@sinclair/typebox](https://www.npmjs.com/package/@sinclair/typebox) | `^0.34.14` |
| [ajv](https://www.npmjs.com/package/ajv) | `^8.17.1` |
| [ajv-formats](https://www.npmjs.com/package/ajv-formats) | `^3.0.1` |
| [fastify-plugin](https://www.npmjs.com/package/fastify-plugin) | `^5.0.1` |
| [form-auto-content](https://www.npmjs.com/package/form-auto-content) | `^3.2.1` |

> ⚠️ **Peer Dependencies**
>
> This package defines 1 peer dependency.

| Peer | Version range |
|---|---|
| `fastify` | `>=5.0.0` |

## References

- [Micropub endpoint (indieweb.org)](https://indieweb.org/micropub-endpoint)

## License

&copy; 2024 - 2025 [Giacomo Debidda](https://www.giacomodebidda.com/) // [MIT License](https://spdx.org/licenses/MIT.html)
