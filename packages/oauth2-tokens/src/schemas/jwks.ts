import { Static, Type } from "@sinclair/typebox";
import { jwk_public, jwk_private } from "./jwk.js";

export const jwks_url = Type.Object(
  {
    hash: Type.String(),
    host: Type.String(),
    href: Type.String(),
    hostname: Type.String(),
    origin: Type.String(),
    password: Type.String(),
    pathname: Type.String(),
    port: Type.String(),
    protocol: Type.String(),
    search: Type.String(),
    searchParams: Type.Any(),
    username: Type.String(),
    toJSON: Type.Any(),
  },
  {
    additionalProperties: true,
    description: `URL where the public JSON Web Key Set is hosted.`,
    title: "JWKS public URL",
  }
);

export type JWKSPublicURL = Static<typeof jwks_url>;

export const jwks_public = Type.Object({
  keys: Type.Array(jwk_public),
});

export type JWKSPublic = Static<typeof jwks_public>;

export const jwks_private = Type.Object(
  {
    keys: Type.Array(jwk_private),
  },
  { description: "Private JSON Web Key Set" }
);

export type JWKSPrivate = Static<typeof jwks_private>;
