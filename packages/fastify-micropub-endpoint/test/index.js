import { describe, it } from "node:test";
import assert from "node:assert";
import Fastify from "fastify";
import introspection from "../lib/index.js";

describe("fastify-introspection-endpoint", () => {
  it("can be registered with no options", () => {
    const fastify = Fastify();

    fastify.register(introspection);

    assert.ok(true);
  });

  it.todo("write some actual tests (probably with light-my-request)");
});
