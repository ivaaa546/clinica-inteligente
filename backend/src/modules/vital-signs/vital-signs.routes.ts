import { Router } from "express";
import { requireDeviceKey } from "../../middleware/device-key.middleware.js";
import { getVitalSigns, putVitalSigns } from "./vital-signs.controller.js";

// Rutas para dispositivos (ESP32): se autentican con x-device-key, no con sesión.
export const devicesRouter = Router();
devicesRouter.use(requireDeviceKey);
devicesRouter.get("/appointments/:citaId/vital-signs", getVitalSigns);
devicesRouter.put("/appointments/:citaId/vital-signs", putVitalSigns);
