import { Type } from "@sinclair/typebox";

export const ajv = Type.Any({ description: "Instance of Ajv" });

export const expiration = Type.String({
  description: `Human-readable expiration time for the token issued by the token endpoint.`,
  minLength: 1,
  title: "Token expiration",
  examples: ["60 seconds", "5 minutes", "1 hour", "30 days"],
});
