import assert from "node:assert";
import { describe, it } from "node:test";
import { ME } from "@repo/stdlib/test-utils";
import { defValidateClaim } from "../lib/index.js";

describe("validateClaim", () => {
  it("can be configured with an assertion and without options", () => {
    const validateClaim = defValidateClaim({
      claim: "me",
      op: "==",
      value: ME,
    });

    assert.ok(validateClaim);
  });

  it.todo(
    "can be configured with an assertion and a custom request context key"
  );

  it.todo("add tests");
});
