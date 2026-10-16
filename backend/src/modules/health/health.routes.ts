import { Router } from "express";

export const healthRouter = Router();

// Endpoint liviano para comprobar que el proceso HTTP esta disponible.
healthRouter.get("/", (_request, response) => {
  response.status(200).json({ status: "ok" });
});
