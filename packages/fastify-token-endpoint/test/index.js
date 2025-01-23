import { describe, it } from "node:test";
import assert from "node:assert";
import Fastify from "fastify";
import token from "../lib/index.js";

describe("fastify-token-endpoint", () => {
  it("can be registered with no options", () => {
    const fastify = Fastify();

    fastify.register(token);

    assert.ok(true);
  });

  it.todo("write some actual tests (probably with light-my-request)");
});
