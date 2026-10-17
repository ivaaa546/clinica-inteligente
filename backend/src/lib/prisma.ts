import { PrismaClient } from "@prisma/client";

// Se comparte una unica instancia para reutilizar el pool de conexiones de Prisma.
export const prisma = new PrismaClient();
