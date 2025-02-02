import type { RouteHandler } from "fastify";
import {
  InvalidTokenError,
  ServerError,
} from "@jackdbd/oauth2-error-responses";
import { throwWhenNotConform } from "@jackdbd/schema-validators";
import { userinfo_get_config } from "../schemas/index.js";
import type {
  UserinfoGetConfig,
  UserProfileImmutableRecord,
  UserProfileMutableRecord,
} from "../schemas/index.js";

// TODO: how to understand that we need to fetch user's info from one
// authentication provider vs another one? Maybe specify the provider in the
// query string? Read specs.

// GitHub userinfo uses OpenID Connect discovery. I think I would need a
// .well-known/openid-configuration file hosted at my profile URL to make it work.
// https://github.com/fastify/fastify-oauth2?tab=readme-ov-file#utilities

export const defUserinfoGet = (config: UserinfoGetConfig) => {
  const ajv = config.ajv;

  throwWhenNotConform(
    { ajv, schema: userinfo_get_config, data: config },
    { basePath: "userinfo-endpoint get method config " }
  );

  const {
    includeErrorDescription: include_error_description,
    logPrefix: log_prefix,
    requestContextKey,
    retrieveUserProfile,
  } = config;

  const userinfoGet: RouteHandler = async (request, reply) => {
    // Should this plugin register the @fastify/request-context plugin?
    const claims = (request as any).requestContext.get(requestContextKey);

    const { me, scope } = claims;

    if (!me) {
      const error_description = `Access token has no 'me' claim.`;
      request.log.warn(`${log_prefix}${error_description}`);
      const err = new InvalidTokenError({ error_description });
      return reply
        .code(err.statusCode)
        .send(err.payload({ include_error_description }));
    }

    const scopes = scope.split(" ");

    // Should we return a server error if the user-provided retrieveUserProfile
    // function returns invalid data (e.g. a user profile with no name)?
    let record:
      | UserProfileImmutableRecord
      | UserProfileMutableRecord
      | undefined;
    try {
      record = await retrieveUserProfile(me);
    } catch (ex: any) {
      const error_description = `Cannot retrieve user profile ${me}. The provided retrieveUserProfile threw an exception: ${ex.message}`;
      const error_uri = undefined;
      request.log.warn(`${log_prefix}${error_description}`);
      const err = new ServerError({ error_description, error_uri });
      return reply
        .code(err.statusCode)
        .send(err.payload({ include_error_description }));
    }

    if (!record) {
      const error_description = `Cannot retrieve user profile ${me}. The provided retrieveUserProfile did not return a record about a user's profile.`;
      const error_uri = undefined;
      const err = new ServerError({ error_description, error_uri });
      return reply
        .code(err.statusCode)
        .send(err.payload({ include_error_description }));
    }

    const REQUIRED_FIELDS = ["name", "photo", "url"];
    REQUIRED_FIELDS.forEach((field) => {
      const value = (record as Record<string, any>)[field] as string;
      if (!value) {
        const error_description = `The user's profile retrieved using retrieveUserProfile has no '${field}' property.`;
        const err = new ServerError({ error_description });
        return reply
          .code(err.statusCode)
          .send(err.payload({ include_error_description }));
      }
    });

    // Note: if we reached this request handler, it means the access token has a
    // 'profile' scope (because we checked it using a fastify hook). We still
    // need to check if the access token also has an 'email' scope though.
    if (scopes.includes("email")) {
      return reply.code(200).send({
        email: record.email,
        name: record.name,
        photo: record.photo,
        url: record.url,
      });
    } else {
      return reply.code(200).send({
        name: record.name,
        photo: record.photo,
        url: record.url,
      });
    }
  };

  return userinfoGet;
};
