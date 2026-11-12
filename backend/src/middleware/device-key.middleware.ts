import { timingSafeEqual } from "node:crypto";
import type { RequestHandler } from "express";
import { env } from "../lib/env.js";
import { ApiError } from "./error.middleware.js";

// Autentica dispositivos (ESP32) con una clave compartida en el header x-device-key.
export const requireDeviceKey: RequestHandler = (request, _response, next) => {
  const expected = env.device.apiKey;
  const received = request.header("x-device-key");
  if (!expected || !received) return next(new ApiError(401, "DEVICE_AUTH_REQUIRED", "Clave de dispositivo requerida"));

  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  // timingSafeEqual exige longitudes iguales; la comparación de longitud no filtra el contenido.
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return next(new ApiError(401, "DEVICE_AUTH_REQUIRED", "Clave de dispositivo invalida"));
  }
  next();
};
