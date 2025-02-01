import assert from "node:assert";
import { before, describe, it } from "node:test";
import Fastify from "fastify";
import { nanoid } from "nanoid";
import { accessTokenFromRequest } from "../lib/index.js";

describe("accessTokenFromRequest", () => {
  let fastify;
  before(() => {
    fastify = Fastify();

    fastify.get("/default", async (request, reply) => {
      const { error, value } = accessTokenFromRequest(request);
      return reply.send({ error, value });
    });

    fastify.get("/custom-request-header", async (request, reply) => {
      const { error, value } = accessTokenFromRequest(request, {
        header: "x-custom-header",
      });
      return reply.send({ error, value });
    });

    fastify.get("/custom-request-header-key", async (request, reply) => {
      const { error, value } = accessTokenFromRequest(request, {
        header_key: "Foo",
      });
      return reply.send({ error, value });
    });
  });

  it("extracts the access token from the 'authorization' request header, key 'Bearer' (default)", async () => {
    const access_token = nanoid();

    const response = await fastify.inject({
      method: "GET",
      headers: {
        authorization: `Bearer ${access_token}`,
      },
      url: "/default",
    });

    const res = response.json();

    assert.strictEqual(response.statusCode, 200);
    assert.strictEqual(res.error, undefined);
    assert.strictEqual(res.value, access_token);
  });

  it("can extract the access token from a custom request header", async () => {
    const access_token = nanoid();

    const response = await fastify.inject({
      method: "GET",
      headers: {
        "x-custom-header": `Bearer ${access_token}`,
      },
      url: "/custom-request-header",
    });

    const res = response.json();

    assert.strictEqual(response.statusCode, 200);
    assert.strictEqual(res.error, undefined);
    assert.strictEqual(res.value, access_token);
  });

  it("can extract the access token from a custom request header key", async () => {
    const access_token = nanoid();

    const response = await fastify.inject({
      method: "GET",
      headers: {
        authorization: `Foo ${access_token}`,
      },
      url: "/custom-request-header-key",
    });

    const res = response.json();

    assert.strictEqual(response.statusCode, 200);
    assert.strictEqual(res.error, undefined);
    assert.strictEqual(res.value, access_token);
  });
});
