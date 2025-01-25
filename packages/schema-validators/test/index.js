import assert from "node:assert";
import { describe, it } from "node:test";
import { Type } from "@sinclair/typebox";
import { defAjv } from "../../stdlib/lib/test-utils.js";
import { conformResult } from "../lib/index.js";

const ajv = defAjv();

describe("conformResult", () => {
  it("returns a result object with an error an no value when data does not conform", () => {
    const schema = Type.String({ minLength: 1 });
    const { error, value } = conformResult({ ajv, schema, data: "" });

    assert.ok(error);
    assert.ok(!value);
  });

  it("returns a result object with the validated value and no error when data conforms", () => {
    const schema = Type.String({ minLength: 1 });
    const data = "hello";
    const { error, value } = conformResult({ ajv, schema, data });

    assert.ok(!error);
    assert.ok(value);
    assert.equal(value.validated, data);
  });
});
