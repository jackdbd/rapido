import assert from "node:assert";
import { describe, it } from "node:test";
import { tokensPlusInfo } from "../lib/index.js";
import { defAjv, ISSUER, jwks } from "../../stdlib/lib/test-utils.js";

const ajv = defAjv();
const issuer = ISSUER;
const ACCESS_TOKEN_EXPIRES_IN_SECONDS = 5;
const REFRESH_TOKEN_EXPIRES_IN_SECONDS = 5;
const access_token_expiration = `${ACCESS_TOKEN_EXPIRES_IN_SECONDS} seconds`;
const refresh_token_expiration = `${REFRESH_TOKEN_EXPIRES_IN_SECONDS} seconds`;

describe("tokensPlusInfo", () => {
  it(`returns an access token and a refresh token, along with additional information with: client_id, issuer, me, redirect_uri, scope, kid`, async () => {
    const client_id = "https://example.com/id";
    const me = "https://example.com/me";
    const redirect_uri = "https://example.com/auth/callback";
    const scope = "create update profile email";

    const { error, value } = await tokensPlusInfo({
      ajv,
      access_token_expiration,
      client_id,
      issuer,
      jwks,
      me,
      redirect_uri,
      refresh_token_expiration,
      scope,
    });

    assert.ok(!error);
    assert.ok(value);

    const { access_token, jti, kid, refresh_token } = value;
    assert.ok(access_token);
    assert.ok(jti);
    assert.ok(kid);
    assert.ok(refresh_token);
    assert.equal(value.client_id, client_id);
    assert.equal(value.issuer, issuer);
    assert.equal(value.me, me);
    assert.equal(value.redirect_uri, redirect_uri);
    assert.equal(value.scope, scope);
  });
});
