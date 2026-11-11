import { z } from "zod";

// La ESP32 solo envía la frecuencia cardíaca (lpm) más metadatos opcionales del dispositivo.
export const deviceVitalSignsSchema = z
  .object({
    frecCardiaca: z.number().int().positive(),
    dispositivoId: z.string().trim().min(1).max(100).optional(),
    medidoEn: z.coerce.date().optional(),
  })
  .strict();

export type DeviceVitalSignsInput = z.infer<typeof deviceVitalSignsSchema>;
