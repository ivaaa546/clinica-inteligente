import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  SESSION_SECRET: z.string().min(32, "SESSION_SECRET must have at least 32 characters"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  ARGON2_TIME_COST: z.coerce.number().int().positive().default(3),
  ARGON2_MEMORY_COST: z.coerce.number().int().positive().default(65536),
  ARGON2_PARALLELISM: z.coerce.number().int().positive().default(1),
  CLINIC_TIMEZONE: z.string().default("America/Tegucigalpa"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const details = parsedEnv.error.issues
    .map(({ path, message }) => `${path.join(".")}: ${message}`)
    .join(", ");

  throw new Error(`Invalid environment configuration: ${details}`);
}

try {
  new Intl.DateTimeFormat("en-US", { timeZone: parsedEnv.data.CLINIC_TIMEZONE });
} catch {
  throw new Error(`Invalid environment configuration: CLINIC_TIMEZONE is invalid`);
}

export const env = {
  databaseUrl: parsedEnv.data.DATABASE_URL,
  sessionSecret: parsedEnv.data.SESSION_SECRET,
  nodeEnv: parsedEnv.data.NODE_ENV,
  argon2: {
    timeCost: parsedEnv.data.ARGON2_TIME_COST,
    memoryCost: parsedEnv.data.ARGON2_MEMORY_COST,
    parallelism: parsedEnv.data.ARGON2_PARALLELISM,
  },
  clinicTimezone: parsedEnv.data.CLINIC_TIMEZONE,
} as const;
