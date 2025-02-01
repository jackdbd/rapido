import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { TObject, TSchema } from "@sinclair/typebox";

export interface Config {
  schema: TSchema; // TObject | TString;
  schemas_root: string;
}

function isTObject(schema: TSchema): schema is TObject {
  return schema.type === "object";
}

export const writeJsonSchema = async (config: Config) => {
  const { schema, schemas_root } = config;

  if (!schema.title) {
    const s = JSON.stringify(schema, null, 2);
    throw new Error(
      `this schema of type ${schema.type} does not have a title:\n${s}`
    );
  }

  if (!schema.$id) {
    const s = JSON.stringify(schema, null, 2);
    throw new Error(
      `this schema of type ${schema.type} does not have an $id:\n${s}`
    );
  }

  // We need to resolve all the $ref in the schema because jsonschema2mk does
  // not currently resolve filesystem refs. If we try to use jsonschema2mk to
  // convert into markdown a schema that contains one or more $ref, it will
  // throw an error.
  const schema_with_no_refs = schema;
  if (isTObject(schema)) {
    for (const [key, skema] of Object.entries(schema.properties)) {
      if (skema.$ref) {
        console.log(
          `[${schema.$id}] property ${key} is a $ref to ${skema.$ref}`
        );
        const fname = `${skema.$ref}.json`;
        const fpath = path.join(schemas_root, fname);
        const str = await readFile(fpath, "utf8");
        schema_with_no_refs.properties[key] = JSON.parse(str);
      }
    }
  }

  const fname = `${schema_with_no_refs.$id}.json`;
  const fpath = path.join(schemas_root, fname);
  const str = JSON.stringify(schema_with_no_refs, null, 2);
  await writeFile(fpath, str, { encoding: "utf8" });
  console.log(`wrote ${fpath}`);
  return fpath;
};
