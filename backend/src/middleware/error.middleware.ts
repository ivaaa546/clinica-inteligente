import type { ErrorRequestHandler, RequestHandler } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Mantiene una respuesta uniforme para rutas inexistentes.
export const notFoundMiddleware: RequestHandler = (_request, response) => {
  response.status(404).json({ error: "Ruta no encontrada", code: "NOT_FOUND" });
};

function knownDomainError(error: Error): ApiError | null {
  const message = error.message;
  if (message === "Credenciales invalidas") return new ApiError(401, "INVALID_CREDENTIALS", message);
  if (/no encontrada|no encontrado|no existe|no pertenece|no esta autorizado|no puede gestionar|no esta asignado/i.test(message)) {
    return new ApiError(404, "RESOURCE_NOT_FOUND", "Recurso no encontrado");
  }
  if (/transicion|ya esta reservado|ya esta publicada|ya tiene una consulta|solapa|citas activas|fue modificada/i.test(message)) {
    return new ApiError(409, "RESOURCE_CONFLICT", message);
  }
  if (/perfil|debe |no puede |no esta habilitada|no son validas|se requiere |tiene un formato|no cumple|fuera de su periodo|no tiene videollamada|acceso de videollamada/i.test(message)) {
    return new ApiError(422, "BUSINESS_RULE_VIOLATION", message);
  }
  return null;
}

// Evita filtrar detalles internos y diferencia fallos de entrada, dominio e infraestructura.
export const errorMiddleware: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof ApiError) {
    response.status(error.status).json({ error: error.message, code: error.code });
    return;
  }

  const isJsonSyntaxError = error instanceof SyntaxError && "body" in error;
  if (isJsonSyntaxError) {
    response.status(400).json({ error: "JSON invalido", code: "INVALID_JSON" });
    return;
  }
  if (error instanceof ZodError) {
    response.status(400).json({ error: "Datos invalidos", code: "VALIDATION_ERROR" });
    return;
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    response.status(409).json({ error: "El recurso ya existe o esta reservado", code: "RESOURCE_CONFLICT" });
    return;
  }
  if (error instanceof Error && error.name === "Error") {
    const domainError = knownDomainError(error);
    if (domainError) {
      response.status(domainError.status).json({ error: domainError.message, code: domainError.code });
      return;
    }
  }

  console.error(error);
  response.status(500).json({ error: "Error interno del servidor", code: "INTERNAL_ERROR" });
};
