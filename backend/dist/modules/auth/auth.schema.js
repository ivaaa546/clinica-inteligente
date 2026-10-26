import { z } from "zod";
export const registerSchema = z.object({
    nombre: z.string().min(1),
    apellidos: z.string().min(1),
    correo: z.string().email(),
    contrasena: z.string().min(8),
    telefono: z.string().min(1),
    fechaNacimiento: z.coerce.date(),
    sexo: z.enum(["M", "F", "NO_ESPECIFICADO"]),
    direccion: z.string().optional(),
    ocupacion: z.string().optional(),
    poblacionMigrante: z.boolean().optional(),
}).strict();
export const loginSchema = z.object({
    correo: z.string().email(),
    contrasena: z.string().min(1),
});
//# sourceMappingURL=auth.schema.js.map