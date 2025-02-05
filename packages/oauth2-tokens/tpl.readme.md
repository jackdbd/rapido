# {{pkg.name}}

{{badges}}

{{pkg.description}}

<!-- toc -->

{{pkg.installation}}

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

{{pkg.docs}}

{{pkg.deps}}

{{pkg.peerDependencies}}

## References

- [Issuing an Access Token - The OAuth 2.0 Authorization Framework (RFC 6749)](https://datatracker.ietf.org/doc/html/rfc6749#section-5)
- [Refreshing an Access Token - The OAuth 2.0 Authorization Framework (RFC 6749)](https://datatracker.ietf.org/doc/html/rfc6749#section-6)
- [Access Token Response - IndieAuth](https://indieauth.spec.indieweb.org/#access-token-response)
- [IndieAuth Rocks! (validator for testing IndieAuth client and server implementations)](https://indieauth.rocks/)
- [IndieAuth scopes](https://indieweb.org/scope#IndieAuth_Scopes): `email`, `profile`
- [Micropub scopes](https://indieweb.org/scope#Microsub_Scopes): `create`, `update`, `delete`, `undelete`, `draft`, `media`

{{pkg.license}}
