import type { ErrorRequestHandler, RequestHandler } from "express";

export const notFoundMiddleware: RequestHandler = (_request, response) => {
  response.status(404).json({ error: "Ruta no encontrada", code: "NOT_FOUND" });
};

export const errorMiddleware: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next,
) => {
  console.error(error);
  response.status(500).json({ error: "Error interno del servidor", code: "INTERNAL_ERROR" });
};
