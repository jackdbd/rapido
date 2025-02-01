import { errorResponseFromJSONResponse } from "@jackdbd/oauth2";
import { ServerError } from "@jackdbd/oauth2-error-responses";
import { AuthorizationResponseBodySuccess } from "./schemas/index.js";

export interface Config {
  authorization_endpoint: string;
  client_id: string;
  code: string;
  code_verifier: string;
  redirect_uri: string;
}

export const verifyAuthorizationCode = async (config: Config) => {
  const {
    authorization_endpoint,
    client_id,
    code,
    code_verifier,
    redirect_uri,
  } = config;

  let response: Response;
  try {
    response = await fetch(authorization_endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id,
        code,
        code_verifier,
        grant_type: "authorization_code",
        redirect_uri,
      }),
    });
  } catch (ex: any) {
    const error_description = `Failed to fetch ${authorization_endpoint}: ${ex.message}`;
    const error_uri = undefined;
    return { error: new ServerError({ error_description, error_uri }) };
  }

  if (!response.ok) {
    const error = await errorResponseFromJSONResponse(response);
    return { error };
  }

  let res_body: AuthorizationResponseBodySuccess;
  try {
    res_body = await response.json();
  } catch (ex: any) {
    const error_description = `Failed to parse JSON response received from ${authorization_endpoint}: ${ex.message}`;
    const error_uri = undefined;
    return { error: new ServerError({ error_description, error_uri }) };
  }

  return { value: res_body };
};
