import { describe, it } from "node:test";
import Fastify from "fastify";
import fastifyRequestContext from "@fastify/request-context";
import { accessToken } from "@jackdbd/oauth2-tokens";
import {
  ACCESS_TOKEN_EXPIRATION,
  CLIENT_ID_NONEXISTENT as client_id,
  defAjv,
  ISSUER as issuer,
  jwks,
  jwks_url as jwksUrl,
  ME as me,
  SCOPE as scope,
} from "@repo/stdlib/test-utils";
import introspectEndpoint from "../lib/index.js";

const ajv = defAjv();

const isAccessTokenRevoked = async (_jti) => {
  // console.log(`verify whether access token jti=${jti} is revoked or not`);
  return false;
};

const retrieveAccessToken = async (jti) => {
  console.log(`retrieve record about access token jti=${jti}`);
  const record = { client_id };
  return record;
};

const retrieveRefreshToken = async (refresh_token) => {
  console.log(`retrieve record about refresh token ${refresh_token}`);
  const record = { client_id };
  return record;
};

describe("introspection-endpoint plugin", () => {
  describe("registration", () => {
    it("adds a POST /introspect route", async (t) => {
      const fastify = Fastify();

      await fastify.register(introspectEndpoint, {
        includeErrorDescription: true,
        isAccessTokenRevoked,
        issuer,
        jwksUrl,
        me,
        retrieveAccessToken,
        retrieveRefreshToken,
      });

      const response = await fastify.inject({
        method: "POST",
        url: "/introspect",
        body: {},
      });

      t.assert.strictEqual(response.statusCode, 400);
    });
  });

  describe("POST /introspect", () => {
    it("returns HTTP 401 (invalid_token) when request body has an invalid token", async (t) => {
      const fastify = Fastify();

      await fastify.register(introspectEndpoint, {
        includeErrorDescription: true,
        isAccessTokenRevoked,
        issuer,
        jwksUrl,
        me,
        retrieveAccessToken,
        retrieveRefreshToken,
      });

      const response = await fastify.inject({
        method: "POST",
        url: "/introspect",
        headers: { authorization: "Bearer abc" },
        body: { token: "def" },
      });

      const res = await response.json();

      t.assert.strictEqual(response.statusCode, 401);
      t.assert.strictEqual(res.error, "invalid_token");
      t.assert.ok(res.error_description.includes("Invalid"));
    });
  });

  it("returns HTTP 200 and a response body with `active`, `client_id`, `me` and `scope`, when the access token is valid", async (t) => {
    const fastify = Fastify();

    fastify.register(fastifyRequestContext);

    await fastify.register(introspectEndpoint, {
      includeErrorDescription: true,
      isAccessTokenRevoked,
      issuer,
      jwksUrl,
      me,
      retrieveAccessToken,
      retrieveRefreshToken,
    });

    const { value } = await accessToken({
      ajv,
      expiration: ACCESS_TOKEN_EXPIRATION,
      issuer,
      jwks,
      me,
      scope,
    });

    const { access_token } = value;

    const response = await fastify.inject({
      method: "POST",
      url: "/introspect",
      headers: { authorization: `Bearer ${access_token}` },
      body: { token: access_token, token_type_hint: "access_token" },
    });

    const res = await response.json();

    t.assert.strictEqual(response.statusCode, 200);
    t.assert.strictEqual(res.active, true);
    t.assert.strictEqual(res.iss, issuer);
    t.assert.strictEqual(res.client_id, client_id);
    t.assert.ok(res.exp > 0);
    t.assert.ok(res.iat > 0);
    t.assert.strictEqual(res.me, me);
    t.assert.strictEqual(res.scope, scope);
  });
});
