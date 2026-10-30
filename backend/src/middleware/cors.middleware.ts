import type { RequestHandler } from "express";
import { env } from "../lib/env.js";

const allowedOrigins = env.corsOrigins;

export const corsMiddleware: RequestHandler = (request, response, next) => {
  const origin = request.header("Origin");

  if (!origin) {
    next();
    return;
  }

  const isAllowed =
    allowedOrigins.includes(origin) ||
    (process.env.NODE_ENV !== "production" && (origin.endsWith(".trycloudflare.com") || origin.includes("localhost")));

  if (!isAllowed) {
    response.status(403).json({ error: "Origen no permitido", code: "CORS_ORIGIN_DENIED" });
    return;
  }

  response.setHeader("Access-Control-Allow-Origin", origin);
  response.setHeader("Access-Control-Allow-Credentials", "true");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,PUT,DELETE,OPTIONS");
  response.setHeader("Vary", "Origin");

  if (request.method === "OPTIONS") {
    response.sendStatus(204);
    return;
  }

  next();
};
