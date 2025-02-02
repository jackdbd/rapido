import type { FastifyRequest } from "fastify";

export interface Options {
  header?: string;
  header_key?: string;
}

const defaults = {
  header: "authorization",
  header_key: "Bearer",
};

export const accessTokenFromRequest = (
  request: FastifyRequest,
  options?: Options
) => {
  const { header, header_key } = Object.assign({}, defaults, options);

  const hkey = header.toLowerCase();
  const hval = request.headers[hkey.toLowerCase()];

  if (!hval) {
    return {
      error: new Error(`No header '${header}' sent with request.`),
    };
  }

  if (hval.indexOf(header_key) === -1) {
    return {
      error: new Error(`No key '${header_key}' in header '${header}'.`),
    };
  }

  // The value of a request header can be an array. This typically happens
  // when multiple headers with the same name are sent in a single request.
  // (e.g. Set-Cookie). I don't think this is a case I should handle, so I
  // return an HTTP 401 error.
  if (Array.isArray(hval)) {
    return { error: new Error(`Request header '${hkey}' is an array.`) };
  }

  const splits = hval.split(" ");

  if (splits.length !== 2) {
    return {
      error: new Error(
        `Request header '${hkey}' has no '${header_key}' value.`
      ),
    };
  }

  const access_token = splits.at(1);

  if (!access_token) {
    return {
      error: new Error(
        `Access token not found in request header '${hkey}' (in '${header_key}').`
      ),
    };
  }

  return { value: access_token };
};
