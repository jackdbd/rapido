import { describe, it } from "node:test";
import assert from "node:assert";
import { accessToken } from "../lib/index.js";
import {
  ACCESS_TOKEN_EXPIRATION,
  ACCESS_TOKEN_EXPIRATION_IN_SECONDS,
  defAjv,
  ISSUER,
  jwks,
  ME,
  REQUIRED_CLAIMS,
} from "../../stdlib/lib/test-utils.js";
import { assertTokenHasExpectedClaims } from "./test-utils.js";

const ajv = defAjv();

describe("accessToken", () => {
  it("returns an error when `scope` is not passed", async () => {
    const { error, value } = await accessToken({
      ajv,
      expiration: ACCESS_TOKEN_EXPIRATION,
      issuer: ISSUER,
      jwks,
      me: ME,
      // scope: SCOPE,
    });

    assert.ok(error);
    assert.ok(!value);
  });

  it(`returns an access token that expires in ${ACCESS_TOKEN_EXPIRATION_IN_SECONDS} seconds`, async () => {
    const me = "https://example.com/me";
    const scope = "create update profile email";

    const { error, value } = await accessToken({
      ajv,
      expiration: ACCESS_TOKEN_EXPIRATION,
      issuer: ISSUER,
      jwks,
      me,
      scope,
    });

    assert.ok(!error);
    assert.ok(value);
    assert.ok(value.access_token);
    assert.equal(value.expires_in, ACCESS_TOKEN_EXPIRATION_IN_SECONDS);
  });

  it(`returns an access token that has these JWT claims: ${REQUIRED_CLAIMS.join(
    ", "
  )}`, async () => {
    const me = "https://example.com/me";
    const scope = "create update profile email";

    const { error, value } = await accessToken({
      ajv,
      expiration: ACCESS_TOKEN_EXPIRATION,
      issuer: ISSUER,
      jwks,
      me,
      scope,
    });

    assert.ok(!error);
    await assertTokenHasExpectedClaims({
      jwt: value.access_token,
      claims: [...REQUIRED_CLAIMS, "me", "scope"],
    });
  });
});
