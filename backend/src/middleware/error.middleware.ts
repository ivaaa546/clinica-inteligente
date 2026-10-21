import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";

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
  const isValidationError = error instanceof ZodError;
  const status = isJsonSyntaxError || isValidationError ? 400 : 500;
  const code = isJsonSyntaxError ? "INVALID_JSON" : isValidationError ? "VALIDATION_ERROR" : "INTERNAL_ERROR";
  const message = isJsonSyntaxError ? "JSON invalido" : isValidationError ? "Datos invalidos" : "Error interno del servidor";

  response.status(status).json({ error: message, code });
};
