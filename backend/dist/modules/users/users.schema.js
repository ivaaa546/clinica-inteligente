import { z } from "zod";
export const createDoctorSchema = z.object({
    nombre: z.string().min(1),
    apellidos: z.string().min(1),
    correo: z.string().email(),
    contrasena: z.string().min(8),
    telefono: z.string().min(1),
    numeroProfesional: z.string().min(1),
    especialidadId: z.string().uuid(),
});
export const updateUserSchema = z.object({
    nombre: z.string().min(1).optional(),
    apellidos: z.string().min(1).optional(),
    telefono: z.string().min(1).optional(),
    correo: z.string().email().optional(),
});
//# sourceMappingURL=users.schema.js.map