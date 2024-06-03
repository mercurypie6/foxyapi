
import express from "express";
const app = express();
const server = require("http").createServer(app);

require("dotenv").config();

import corsMiddleware from "./middleware/cors.middleware";
import logger from "./middleware/logger";
import { mongoConnect } from  "./utils/mongoConnect";
import { errorHandler } from "./middleware/error.middleware";


import { router as authRouter } from "./routes/auth.routes";
import { router as businesRouter } from "./routes/busines.routes";
import { sseRouter} from "./routes/sse.routes";

const PORT = process.env.PORT || Number(9001);

app.use(express.urlencoded({ extended: true }));
app.use(corsMiddleware);
app.use(express.json());
app.use(logger);
app.use("/api", sseRouter);
app.use("/api/auth", authRouter);
app.use("/api/busines", businesRouter);
app.use(errorHandler)

process.on("uncaughtException", (e: Error) => {
  process.stderr.write("uncaughtException:" + e);
  server.close(() => process.exit(1));
  setTimeout(() => {
    process.abort();
  }, 1000).unref();
});
process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
  process.stderr.write("unhandledRejection:", reason);
  server.close(() => process.exit(1));
  setTimeout(() => {
    process.abort();
  }, 1000).unref();
});
process.on("SIGINT", function () {
  console.log("SIGINT recieved");
  process.exit(0);
});
process.on("SIGTERM", function () {
  console.log("SIGTERM recieved");
  process.exit(0);
});

async function start() {
  try {
    mongoConnect();
   
    server.listen(PORT, () => {
      process.stdout.write(
        `stdout: server started on port ${PORT} process id: ${process.pid}\n`
      );
    });
  } catch (e: unknown) {
    process.stderr.write("some error occured:", );
    console.log("some error", e)
  }
}

start();
