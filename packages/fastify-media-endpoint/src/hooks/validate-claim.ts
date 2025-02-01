import {
  InvalidRequestError,
  InvalidTokenError,
  UnauthorizedError,
} from "@jackdbd/oauth2-error-responses";
import type { AccessTokenClaims } from "@jackdbd/oauth2-tokens";
import type { RequestContextData } from "@fastify/request-context";
import { preHandlerHookHandler } from "fastify";
import type { Assertion, Value } from "../schemas/assertion.js";

interface Options {
  includeErrorDescription?: boolean;
  logPrefix?: string;
  requestContextKey?: string;
}

const defaults: Partial<Options> = {
  includeErrorDescription: false,
  logPrefix: "[validate claim] ",
  requestContextKey: "access_token_claims",
};

export const defValidateClaim = (assertion: Assertion, options?: Options) => {
  const config = Object.assign({}, defaults, options) as Required<Options>;

  const ctx_key = config.requestContextKey as keyof RequestContextData;

  const { includeErrorDescription: include_error_description, logPrefix } =
    config;

  if (!ctx_key) {
    throw new Error("requestContextKey is required");
  }

  const validateClaim: preHandlerHookHandler = (request, reply, done) => {
    request.log.debug(
      `${logPrefix}get access token claims from request context key '${ctx_key}'`
    );

    const claims = request.requestContext.get(ctx_key) as AccessTokenClaims;

    if (!claims) {
      const error_description = `No access token claims in request context, under key '${ctx_key}'`;
      const err = new UnauthorizedError({ error_description });
      return reply
        .code(err.statusCode)
        .send(err.payload({ include_error_description }));
    }

    const key = assertion.claim;

    if (!assertion.op && !assertion.value) {
      if (!claims[key]) {
        const error_description = `No claim '${key}' in request context, under key '${ctx_key}'`;
        const err = new UnauthorizedError({ error_description });
        return reply
          .code(err.statusCode)
          .send(err.payload({ include_error_description }));
      } else {
        return done();
      }
    }

    const op = assertion.op || "==";
    const actual = claims[key] as string | number | boolean;

    let given: Value;
    if (typeof assertion.value === "function") {
      request.log.debug(
        `${logPrefix}the value provided for validating claim '${key}' is a function. Invoking it now.`
      );
      given = assertion.value();
    } else {
      given = assertion.value;
    }
    request.log.debug(
      `${logPrefix}validate assertion on claim '${key}': ${actual} ${op} ${given}`
    );

    if (given === undefined) {
      const error_description = `Invalid assertion on claim '${key}'. The value given for the assertion is (or resolved to) undefined.`;
      const err = new InvalidRequestError({ error_description });
      return reply
        .code(err.statusCode)
        .send(err.payload({ include_error_description }));
    }

    // https://micropub.spec.indieweb.org/#error-response
    switch (op) {
      case "==": {
        if (actual !== given) {
          const error_description = `claim '${key}' is '${actual}', but it should be '${given}'`;
          const err = new InvalidTokenError({ error_description });
          return reply
            .code(err.statusCode)
            .send(err.payload({ include_error_description }));
        } else {
          return done();
        }
      }

      case "!=": {
        if (actual === given) {
          const error_description = `claim '${key}' is '${actual}', but it should not be '${given}'`;
          const err = new InvalidTokenError({ error_description });
          return reply
            .code(err.statusCode)
            .send(err.payload({ include_error_description }));
        } else {
          return done();
        }
      }

      case "<": {
        if (actual >= given) {
          const error_description = `claim '${key}' is '${actual}', but it should be less than '${given}'`;
          const err = new InvalidTokenError({ error_description });
          return reply
            .code(err.statusCode)
            .send(err.payload({ include_error_description }));
        } else {
          return done();
        }
      }

      case "<=": {
        if (actual > given) {
          const error_description = `claim '${key}' is '${actual}', but it should be less than or equal to '${given}'`;
          const err = new InvalidTokenError({ error_description });
          return reply
            .code(err.statusCode)
            .send(err.payload({ include_error_description }));
        } else {
          return done();
        }
      }

      case ">": {
        if (actual <= given) {
          const error_description = `claim '${key}' is '${actual}', but it should be greater than '${given}'`;
          const err = new InvalidTokenError({ error_description });
          return reply
            .code(err.statusCode)
            .send(err.payload({ include_error_description }));
        } else {
          return done();
        }
      }

      case ">=": {
        if (actual < given) {
          const error_description = `claim '${key}' is '${actual}', but it should be greater than or equal to '${given}'`;
          const err = new InvalidTokenError({ error_description });
          return reply
            .code(err.statusCode)
            .send(err.payload({ include_error_description }));
        } else {
          return done();
        }
      }

      default: {
        const message = `received unknown operation '${assertion.op}' (ignored)`;
        request.log.warn(`${logPrefix}${message}`);
        return done();
      }
    }
  };

  return validateClaim;
};
