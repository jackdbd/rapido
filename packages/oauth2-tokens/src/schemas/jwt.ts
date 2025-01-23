import { Type } from "@sinclair/typebox";

export const jwt = Type.String({ minLength: 1 });

export const exp = Type.Number({
  description: `UNIX timestamp when the JWT expires`,
  minimum: 0,
  title: '"exp" (Expiration Time) Claim',
});

export const iat = Type.Number({
  description: `UNIX timestamp when the JWT was issued`,
  minimum: 0,
  title: '"iat" (Issued At) Claim',
});

export const iss = Type.String({
  description: `Token issuer`,
  minLength: 1,
  title: '"iss" (Issuer) Claim',
});

// https://datatracker.ietf.org/doc/html/rfc7519#section-4.1.7
export const jti = Type.String({
  description: `Unique identifier for the JWT`,
  minLength: 1,
  title: '"jti" (JWT ID) Claim',
});
