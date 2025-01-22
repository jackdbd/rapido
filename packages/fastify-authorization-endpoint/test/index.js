import { describe, it } from "node:test";
import assert from "node:assert";
import Fastify from "fastify";
import authorizationEndpoint from "../lib/index.js";

describe("authorization endpoint", () => {
  it("can be registered with no options", () => {
    const fastify = Fastify();

    fastify.register(authorizationEndpoint);

    assert.ok(true);
  });

  it.todo("write some actual tests (probably with light-my-request)");
});
