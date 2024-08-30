import { env } from "@/common/utils/envConfig";
import { app, logger } from "@/server";
import cors from "cors";
import { Server } from "socket.io";
import { wsRoutes } from "./wsServer";

const server = app.listen(env.PORT, () => {
  const { NODE_ENV, PORT } = env;
  logger.info(`Server (${NODE_ENV}) running on port ${PORT}`);
});

export const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://motion-minhaya-sxmhgfgw6q-an.a.run.app"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

wsRoutes(io);

const onCloseSignal = () => {
  logger.info("sigint received, shutting down");
  server.close(() => {
    logger.info("server closed");
    process.exit();
  });
  setTimeout(() => process.exit(1), 1000).unref(); // Force shutdown after 10s
};

process.on("SIGINT", onCloseSignal);
process.on("SIGTERM", onCloseSignal);
