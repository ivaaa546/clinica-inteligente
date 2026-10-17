import argon2 from "argon2";

// Argon2id incorpora la sal y sus parametros dentro del hash almacenado.
export const hashPassword = (password: string) =>
  argon2.hash(password, {
    type: argon2.argon2id,
    timeCost: Number(process.env.ARGON2_TIME_COST ?? 3),
    memoryCost: Number(process.env.ARGON2_MEMORY_COST ?? 65536),
    parallelism: Number(process.env.ARGON2_PARALLELISM ?? 1),
  });

// Argon2 verifica el hash almacenado y nunca requiere guardar la contraseña original.
export const verifyPassword = (hash: string, password: string) => argon2.verify(hash, password);
