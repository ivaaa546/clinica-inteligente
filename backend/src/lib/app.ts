import express from "express";
import { errorMiddleware, notFoundMiddleware } from "../middleware/error.middleware.js";
import { healthRouter } from "../modules/health/health.routes.js";

export const app = express();

// La aplicacion queda separada del listener para poder probarla sin abrir un puerto.
app.disable("x-powered-by");
app.use(express.json());
app.use("/health", healthRouter);
app.use(notFoundMiddleware);
app.use(errorMiddleware);
