export interface Config {
  authorization_endpoint: string;
  client_id: string;
  host: string;
  includeErrorDescription: boolean;
  issuer: string;
  log_level: string;
  me: string;
  port: number;
  redirect_uri: string;
  reportAllAjvErrors: boolean;
  revocation_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint: string;
}

export const defConfig = (port: number): Config => {
  const base_url = process.env.BASE_URL || `http://localhost:${port}`;

  return {
    authorization_endpoint: `${base_url}/auth`,
    client_id: "https://micropub.fly.dev/id",
    host: process.env.HOST || "0.0.0.0",
    includeErrorDescription: true,
    issuer: base_url,
    log_level: process.env.PINO_LOG_LEVEL || "info",
    me: "https://giacomodebidda.com/",
    port,
    redirect_uri: `${base_url}/auth/callback`,
    reportAllAjvErrors: true,
    revocation_endpoint: `${base_url}/revoke`,
    token_endpoint: `${base_url}/token`,
    userinfo_endpoint: `${base_url}/userinfo`,
  };
};
