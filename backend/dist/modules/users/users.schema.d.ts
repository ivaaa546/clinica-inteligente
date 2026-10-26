import { z } from "zod";
export declare const createDoctorSchema: z.ZodObject<{
    nombre: z.ZodString;
    apellidos: z.ZodString;
    correo: z.ZodString;
    contrasena: z.ZodString;
    telefono: z.ZodString;
    numeroProfesional: z.ZodString;
    especialidadId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    correo: string;
    nombre: string;
    apellidos: string;
    telefono: string;
    numeroProfesional: string;
    especialidadId: string;
    contrasena: string;
}, {
    correo: string;
    nombre: string;
    apellidos: string;
    telefono: string;
    numeroProfesional: string;
    especialidadId: string;
    contrasena: string;
}>;
export declare const updateUserSchema: z.ZodObject<{
    nombre: z.ZodOptional<z.ZodString>;
    apellidos: z.ZodOptional<z.ZodString>;
    telefono: z.ZodOptional<z.ZodString>;
    correo: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    correo?: string | undefined;
    nombre?: string | undefined;
    apellidos?: string | undefined;
    telefono?: string | undefined;
}, {
    correo?: string | undefined;
    nombre?: string | undefined;
    apellidos?: string | undefined;
    telefono?: string | undefined;
}>;
