import { describe, it } from "node:test";
import assert from "node:assert";
import Fastify from "fastify";
import micropub from "../lib/index.js";

describe("fastify-micropub-endpoint", () => {
  it("can be registered with no options", () => {
    const fastify = Fastify();

    fastify.register(micropub);

    assert.ok(true);
  });

  it.todo("write some actual tests (probably with light-my-request)");
});
