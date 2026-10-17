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
  const isJsonSyntaxError = error instanceof SyntaxError && "body" in error;
  const status = isJsonSyntaxError ? 400 : 500;
  const code = isJsonSyntaxError ? "INVALID_JSON" : "INTERNAL_ERROR";
  const message = isJsonSyntaxError ? "JSON invalido" : "Error interno del servidor";

  response.status(status).json({ error: message, code });
};
