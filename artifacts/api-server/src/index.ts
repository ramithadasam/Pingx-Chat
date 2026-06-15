import { createServer } from "http";
import app from "./app";
import { initSockets } from "./sockets";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { logger } from "./lib/logger";
import { env } from "./config/env";

const { port } = env;

const httpServer = createServer(app);
initSockets(httpServer);

app.use(notFoundHandler);
app.use(errorHandler);

httpServer.listen(port, (err?: Error) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port, env: env.nodeEnv }, "PingX API server listening");
});
