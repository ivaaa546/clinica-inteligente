import type { ErrorRequestHandler, RequestHandler } from "express";

// Mantiene una respuesta uniforme para rutas inexistentes.
export const notFoundMiddleware: RequestHandler = (_request, response) => {
  response.status(404).json({ error: "Ruta no encontrada", code: "NOT_FOUND" });
};

// Evita filtrar detalles internos de los errores a los clientes HTTP.
export const errorMiddleware: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next,
) => {
  console.error(error);
  response.status(500).json({ error: "Error interno del servidor", code: "INTERNAL_ERROR" });
};
