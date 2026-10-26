import { z } from "zod";
export declare const registerSchema: z.ZodObject<{
    nombre: z.ZodString;
    apellidos: z.ZodString;
    correo: z.ZodString;
    contrasena: z.ZodString;
    telefono: z.ZodString;
    fechaNacimiento: z.ZodDate;
    sexo: z.ZodEnum<["M", "F", "NO_ESPECIFICADO"]>;
    direccion: z.ZodOptional<z.ZodString>;
    ocupacion: z.ZodOptional<z.ZodString>;
    poblacionMigrante: z.ZodOptional<z.ZodBoolean>;
}, "strict", z.ZodTypeAny, {
    correo: string;
    nombre: string;
    apellidos: string;
    telefono: string;
    fechaNacimiento: Date;
    sexo: "M" | "F" | "NO_ESPECIFICADO";
    contrasena: string;
    direccion?: string | undefined;
    ocupacion?: string | undefined;
    poblacionMigrante?: boolean | undefined;
}, {
    correo: string;
    nombre: string;
    apellidos: string;
    telefono: string;
    fechaNacimiento: Date;
    sexo: "M" | "F" | "NO_ESPECIFICADO";
    contrasena: string;
    direccion?: string | undefined;
    ocupacion?: string | undefined;
    poblacionMigrante?: boolean | undefined;
}>;
export declare const loginSchema: z.ZodObject<{
    correo: z.ZodString;
    contrasena: z.ZodString;
}, "strip", z.ZodTypeAny, {
    correo: string;
    contrasena: string;
}, {
    correo: string;
    contrasena: string;
}>;
