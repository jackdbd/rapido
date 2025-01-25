import assert from "node:assert";
import { describe, it } from "node:test";
import { InvalidRequestError, ServerError } from "../lib/index.js";

describe("InvalidRequestError", () => {
  it("has status code 400", () => {
    const error_description = "Some client error";
    const err = new InvalidRequestError({ error_description });

    assert.equal(err.statusCode, 400);
  });

  it("has a payload with `error` but no `error_description` by default", () => {
    const error_description = "Some client error";
    const err = new InvalidRequestError({ error_description });

    const payload = err.payload();

    assert.ok(payload.error);
    assert.equal(payload.error_description, undefined);
  });

  it("has a payload with `error` and also `error_description` if option include_error_description is true", () => {
    const error_description = "Some client error";
    const err = new InvalidRequestError({ error_description });

    const payload = err.payload({ include_error_description: true });

    assert.ok(payload.error);
    assert.equal(payload.error_description, error_description);
  });
});

describe("ServerError", () => {
  it("has status code 500", () => {
    const error_description = "Some client error";
    const err = new ServerError({ error_description });

    assert.equal(err.statusCode, 500);
  });
});
