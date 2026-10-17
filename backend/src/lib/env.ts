import { z } from "zod";

// Centraliza y valida toda la configuracion necesaria antes de iniciar el servidor.
const envSchema = z.object({
  DATABASE_URL: z
    .string({ required_error: "DATABASE_URL es obligatoria" })
    .min(1, "DATABASE_URL es obligatoria"),
  SESSION_SECRET: z
    .string({ required_error: "SESSION_SECRET es obligatoria" })
    .min(32, "SESSION_SECRET debe tener al menos 32 caracteres"),
  PORT: z.coerce.number().int().positive().default(3000),
  CORS_ORIGINS: z.string().default("http://localhost:5173"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  ARGON2_TIME_COST: z.coerce.number().int().positive().default(3),
  ARGON2_MEMORY_COST: z.coerce.number().int().positive().default(65536),
  ARGON2_PARALLELISM: z.coerce.number().int().positive().default(1),
  CLINIC_TIMEZONE: z.string().default("America/Guatemala"),
});

const parsedEnv = envSchema.safeParse(process.env);

// Un proceso mal configurado no debe iniciar y fallar mas tarde con un error ambiguo.
if (!parsedEnv.success) {
  const details = parsedEnv.error.issues
    .map(({ path, message }) => `${path.join(".")}: ${message}`)
    .join(", ");

  throw new Error(`Configuracion de entorno invalida: ${details}`);
}

// Intl valida que la zona horaria sea reconocida por el runtime de Node.js.
try {
  new Intl.DateTimeFormat("en-US", { timeZone: parsedEnv.data.CLINIC_TIMEZONE });
} catch {
  throw new Error("Configuracion de entorno invalida: CLINIC_TIMEZONE no es valida");
}

export const env = {
  databaseUrl: parsedEnv.data.DATABASE_URL,
  sessionSecret: parsedEnv.data.SESSION_SECRET,
  port: parsedEnv.data.PORT,
  corsOrigins: parsedEnv.data.CORS_ORIGINS.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  nodeEnv: parsedEnv.data.NODE_ENV,
  argon2: {
    timeCost: parsedEnv.data.ARGON2_TIME_COST,
    memoryCost: parsedEnv.data.ARGON2_MEMORY_COST,
    parallelism: parsedEnv.data.ARGON2_PARALLELISM,
  },
  clinicTimezone: parsedEnv.data.CLINIC_TIMEZONE,
} as const;
