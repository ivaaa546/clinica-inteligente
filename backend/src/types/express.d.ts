import type { RolUsuario } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        role: RolUsuario;
      };
    }
  }
}

export {};
