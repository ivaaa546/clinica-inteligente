import { ModalidadAtencion } from "@prisma/client";
import { z } from "zod";

const modalidades = z
  .array(z.nativeEnum(ModalidadAtencion))
  .min(1, "Debe seleccionar al menos una modalidad")
  .max(2)
  .refine((values) => new Set(values).size === values.length, "No se permiten modalidades duplicadas");

export const availabilitySchema = z.object({ inicio: z.coerce.date(), modalidades });
export const updateAvailabilitySchema = z.object({ modalidades });
