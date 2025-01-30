import { describe, it } from "node:test";
import assert from "node:assert";
import { defAjv } from "@repo/stdlib/test-utils";
import { p_altitude, p_latitude, p_longitude, p_geo } from "../lib/index.js";

const ajv = defAjv();

describe("altitude", () => {
  it("has the expected $id", () => {
    assert.strictEqual(p_altitude.$id, "p-altitude");
  });

  it("can be a negative number", () => {
    // const valid = validateAltitude(-100);
    const valid = ajv.validate(p_altitude, -100);
    assert(valid);
  });
});

describe("latitude", () => {
  it("has the expected $id", () => {
    assert.strictEqual(p_latitude.$id, "p-latitude");
  });
});

describe("longitude", async () => {
  it("has the expected $id", () => {
    assert.strictEqual(p_longitude.$id, "p-longitude");
  });
});

describe("geo-uri", async () => {
  it("is not any string", () => {
    const valid = ajv.validate(p_geo, "foobar");
    assert.ok(!valid);

    const validate = ajv.compile(p_geo);
    const is_valid = validate("foobar");
    assert.ok(!is_valid);
    assert(validate.errors.length > 0);
  });

  it("is a string defined in RFC 5870", () => {
    // const valid = validateGeoURI('geo:37.786971,-122.399677;u=35')
    const valid = ajv.validate(p_geo, "geo:37.786971,-122.399677;u=35");
    assert(valid);
  });
});
