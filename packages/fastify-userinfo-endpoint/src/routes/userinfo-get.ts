import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { accessTokenFromRequest } from "@jackdbd/fastify-utils";
import { Profile } from "@jackdbd/indieauth";
import {
  InsufficientScopeError,
  InvalidRequestError,
  InvalidTokenError,
  ServerError,
  UnauthorizedError,
} from "@jackdbd/oauth2-error-responses";
import { safeDecode } from "@jackdbd/oauth2-tokens";
import type { AccessTokenClaims } from "@jackdbd/oauth2-tokens";
import { throwWhenNotConform } from "@jackdbd/schema-validators";
import { isExpired } from "../predicates.js";
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

// interface RouteGeneric extends RouteGenericInterface {
//   Body: IntrospectionRequestBody;
// }

export const defUserinfoGet = (config: UserinfoGetConfig) => {
  const ajv = config.ajv;

  throwWhenNotConform(
    { ajv, schema: userinfo_get_config, data: config },
    { basePath: "userinfo-endpoint get method config " }
  );

  const {
    includeErrorDescription: include_error_description,
    isAccessTokenRevoked,
    logPrefix: log_prefix,
    retrieveUserProfile,
  } = config;

  return async function userinfoGet(
    this: FastifyInstance,
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const authorization = request.headers.authorization;

    if (!authorization) {
      const error_description = `Authorization header not set.`;
      const err = new UnauthorizedError({ error_description });
      return reply
        .code(err.statusCode)
        .send(err.payload({ include_error_description }));
    }

    const { value: access_token } = accessTokenFromRequest(request);

    if (!access_token) {
      const error_description = `Cannot retrieve profile info: no access token in Authorization header.`;
      const error_uri = undefined;
      const err = new UnauthorizedError({ error_description, error_uri });
      return reply
        .code(err.statusCode)
        .send(err.payload({ include_error_description }));
    }

    const { error: decode_error, value: claims } =
      await safeDecode<AccessTokenClaims>(access_token);

    if (decode_error) {
      const error_description = `Error while decoding access token: ${decode_error.message}`;
      const error_uri = undefined;
      const err = new InvalidTokenError({ error_description, error_uri });
      return reply
        .code(err.statusCode)
        .send(err.payload({ include_error_description }));
    }

    const { exp, jti, me } = claims;

    // TODO: move this check to a fastify hook that ensures the token is not expired
    request.log.debug(
      `${log_prefix}check whether access token jti=${jti} is expired`
    );
    if (isExpired(exp)) {
      const error_description = `Access token is expired`;
      const error_uri = undefined;
      const err = new InvalidTokenError({ error_description, error_uri });
      return reply
        .code(err.statusCode)
        .send(err.payload({ include_error_description }));
    }

    // TODO: move this check to a fastify hook that ensures the token is not revoked
    let revoked = false;
    request.log.debug(
      `${log_prefix}check whether access token jti=${jti} is revoked`
    );
    try {
      revoked = await isAccessTokenRevoked(jti);
    } catch (ex: any) {
      const error_description = `Cannot determine whether access token jti=${jti} is revoked or not: ${ex.message}`;
      const err = new ServerError({ error_description });
      return reply
        .code(err.statusCode)
        .send(err.payload({ include_error_description }));
    }
    if (revoked) {
      const error_description = `Access token is revoked`;
      const error_uri = undefined;
      const err = new InvalidTokenError({ error_description, error_uri });
      return reply
        .code(err.statusCode)
        .send(err.payload({ include_error_description }));
    }

    const scopes = claims.scope.split(" ");

    // TODO: move this check to a fastify hook that validates the `scope` claim
    if (!scopes.includes("profile")) {
      const error_description = `Access token has no 'profile' scope.`;
      const error_uri = undefined;
      const err = new InsufficientScopeError({ error_description, error_uri });
      return reply
        .code(err.statusCode)
        .send(err.payload({ include_error_description }));
    }

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
      const error_description = `Cannot retrieve ${me} among the user profiles. The provided retrieveUserProfile did not return a record about a user's profile.`;
      const error_uri = undefined;
      const err = new InvalidRequestError({ error_description, error_uri });
      return reply
        .code(err.statusCode)
        .send(err.payload({ include_error_description }));
    }

    const profile: Profile = {
      name: record.name,
      photo: record.photo,
      url: record.url,
    };
    if (scopes.includes("email")) {
      profile.email = record.email;
    }

    return reply.code(200).send(profile);
  };
};
