import { afterAll, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";

const enabled = Boolean(process.env.TEST_DATABASE_URL);
const prisma = new PrismaClient();

describe.runIf(enabled)("migraciones de modalidad y revocacion", () => {
  it("instala restricciones e indices para agenda, signos y revocacion", async () => {
    const constraints = await prisma.$queryRaw<Array<{ conname: string }>>`
      SELECT conname FROM pg_constraint
      WHERE conname IN (
        'disponibilidad_modalidades_no_vacias',
        'cita_modalidad_datos_validos',
        'signos_vitales_estados_y_valores_validos'
      )
    `;
    const indexes = await prisma.$queryRaw<Array<{ indexname: string }>>`
      SELECT indexname FROM pg_indexes
      WHERE schemaname = 'public' AND indexname IN (
        'cita_disponibilidad_activa_key',
        'tarea_revocacion_video_activa_por_cita_y_causa_key'
      )
    `;

    expect(constraints.map((row) => row.conname).sort()).toEqual([
      'cita_modalidad_datos_validos',
      'disponibilidad_modalidades_no_vacias',
      'signos_vitales_estados_y_valores_validos',
    ]);
    expect(indexes.map((row) => row.indexname).sort()).toEqual([
      'cita_disponibilidad_activa_key',
      'tarea_revocacion_video_activa_por_cita_y_causa_key',
    ]);
  });
});

afterAll(async () => prisma.$disconnect());
