import { prisma } from "../src/lib/prisma.js";

export default async function globalTeardown() {
  await prisma.$disconnect();
}
