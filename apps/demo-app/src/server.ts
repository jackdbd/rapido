import { parseArgs } from "node:util";
import closeWithGrace from "close-with-grace";
import { defFastify } from "./app.js";
import { defConfig } from "./config.js";

const { values } = parseArgs({
  allowPositionals: false,
  options: {
    port: { type: "string", default: "3000" },
    "print-plugins": { type: "boolean", default: false },
    "print-routes": { type: "boolean", default: false },
  },
});

const { "print-plugins": print_plugins, "print-routes": print_routes } = values;
const port = parseInt(values.port);

const config = defConfig(port);

const fastify = defFastify(config);

const start = async () => {
  try {
    await fastify.listen({ host: config.host, port: config.port });

    if (print_plugins) {
      console.log("=== Fastify plugins ===");
      console.log(fastify.printPlugins());
    }
    if (print_routes) {
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
