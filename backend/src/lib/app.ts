import express from "express";
import helmet from "helmet";
import { corsMiddleware } from "../middleware/cors.middleware.js";
import { errorMiddleware, notFoundMiddleware } from "../middleware/error.middleware.js";
import { healthRouter } from "../modules/health/health.routes.js";
import { sessionMiddleware } from "./session.js";

export const app = express();

// La aplicacion queda separada del listener para poder probarla sin abrir un puerto.
app.disable("x-powered-by");
app.use(helmet());
app.use(corsMiddleware);
app.use(express.json({ limit: "1mb" }));
app.use(sessionMiddleware);
app.use("/health", healthRouter);
app.use(notFoundMiddleware);
app.use(errorMiddleware);
