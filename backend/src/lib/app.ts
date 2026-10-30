import express from "express";
import helmet from "helmet";
import { corsMiddleware } from "../middleware/cors.middleware.js";
import { errorMiddleware, notFoundMiddleware } from "../middleware/error.middleware.js";
import { healthRouter } from "../modules/health/health.routes.js";
import { apiRouter } from "../routes/api.routes.js";
import { env } from "./env.js";
import { prisma } from "./prisma.js";
import { sessionMiddleware } from "./session.js";

export const app = express();
app.locals.prisma = prisma;

// Render termina TLS antes de reenviar la petición; Express debe confiar en ese proxy
// para emitir correctamente cookies Secure en producción.
if (env.nodeEnv === "production") {
  app.set("trust proxy", 1);
}

// La aplicacion queda separada del listener para poder probarla sin abrir un puerto.
app.disable("x-powered-by");
app.use(helmet());
app.use(corsMiddleware);
app.use(express.json({ limit: "1mb" }));
app.use(sessionMiddleware);
app.use("/api/v1", apiRouter);
app.use("/health", healthRouter);
app.use(notFoundMiddleware);
app.use(errorMiddleware);
