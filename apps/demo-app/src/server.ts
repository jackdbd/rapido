import closeWithGrace from "close-with-grace";
import { defFastify } from "./app.js";

// const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const port = 3001;
const base_url = process.env.BASE_URL || `http://localhost:${port}`;

const config = {
  authorization_endpoint: `${base_url}/auth`,
  // client_id: "https://micropub.fly.dev/id",
  host: process.env.HOST || "0.0.0.0",
  includeErrorDescription: true,
  issuer: base_url,
  log_level: process.env.PINO_LOG_LEVEL || "info",
  me: "https://giacomodebidda.com/",
  port,
  reportAllAjvErrors: true,
  token_endpoint: `${base_url}/token`,
};

const fastify = await defFastify(config);

const start = async () => {
  try {
    await fastify.listen({ host: config.host, port: config.port });

    if (process.env.NODE_ENV === "development") {
      console.log("=== Fastify plugins ===");
      console.log(fastify.printPlugins());
      console.log("=== Fastify routes ===");
      console.log(fastify.printRoutes({ includeHooks: true }));
    }
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

closeWithGrace({ delay: 10000 }, async ({ err }) => {
  if (err) {
    fastify.log.error({ err }, "server closing due to error");
  } else {
    fastify.log.info("shutting down gracefully");
  }
  await fastify.close();
});
