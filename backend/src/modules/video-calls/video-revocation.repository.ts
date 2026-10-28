import { randomUUID } from "node:crypto";
import {
  CausaRevocacionVideo,
  EstadoTareaRevocacionVideo,
  Prisma,
  PrismaClient,
  TareaRevocacionVideo,
} from "@prisma/client";

type DbClient = PrismaClient | Prisma.TransactionClient;

// La tabla tiene un indice unico parcial; estas operaciones conservan esa invariante
// aun cuando mas de un procesador intente reclamar trabajo al mismo tiempo.
export class VideoRevocationRepository {
  constructor(private readonly db: DbClient) {}

  async enqueue(citaId: string, causa: CausaRevocacionVideo, now = new Date()) {
    const id = randomUUID();
    const tasks = await this.db.$queryRaw<TareaRevocacionVideo[]>(Prisma.sql`
      INSERT INTO "tarea_revocacion_video" (
        "id", "cita_id", "causa", "estado", "intentos", "proximo_intento_en", "creado_en", "actualizado_en"
      ) VALUES (
        ${id}::uuid, ${citaId}::uuid, ${causa}::"CausaRevocacionVideo", 'PENDIENTE'::"EstadoTareaRevocacionVideo", 0, ${now}, ${now}, ${now}
      )
      ON CONFLICT ("cita_id", "causa")
        WHERE "estado" IN ('PENDIENTE', 'EN_PROCESO')
      DO UPDATE SET "actualizado_en" = "tarea_revocacion_video"."actualizado_en"
      RETURNING
        "id", "cita_id" AS "citaId", "causa", "estado", "intentos",
        "proximo_intento_en" AS "proximoIntentoEn", "completada_en" AS "completadaEn",
        "creado_en" AS "creadoEn", "actualizado_en" AS "actualizadoEn"
    `);

    return tasks[0];
  }

  // SKIP LOCKED permite que cada consumidor reciba una tarea distinta sin bloqueo global.
  async claimNext(now = new Date()) {
    const tasks = await this.db.$queryRaw<TareaRevocacionVideo[]>(Prisma.sql`
      WITH siguiente AS (
        SELECT "id"
        FROM "tarea_revocacion_video"
        WHERE "estado" = 'PENDIENTE'::"EstadoTareaRevocacionVideo"
          AND "proximo_intento_en" <= ${now}
        ORDER BY "proximo_intento_en" ASC, "creado_en" ASC
        FOR UPDATE SKIP LOCKED
        LIMIT 1
      )
      UPDATE "tarea_revocacion_video" AS tarea
      SET
        "estado" = 'EN_PROCESO'::"EstadoTareaRevocacionVideo",
        "intentos" = tarea."intentos" + 1,
        "actualizado_en" = ${now}
      FROM siguiente
      WHERE tarea."id" = siguiente."id"
      RETURNING
        tarea."id", tarea."cita_id" AS "citaId", tarea."causa", tarea."estado", tarea."intentos",
        tarea."proximo_intento_en" AS "proximoIntentoEn", tarea."completada_en" AS "completadaEn",
        tarea."creado_en" AS "creadoEn", tarea."actualizado_en" AS "actualizadoEn"
    `);

    return tasks[0] ?? null;
  }

  async complete(id: string, completedAt = new Date()) {
    // updateMany devuelve cero para una tarea ya completada: el consumidor puede ser idempotente.
    const result = await this.db.tareaRevocacionVideo.updateMany({
      where: { id, estado: { not: EstadoTareaRevocacionVideo.COMPLETADA } },
      data: {
        estado: EstadoTareaRevocacionVideo.COMPLETADA,
        completadaEn: completedAt,
      },
    });

    return result.count === 1;
  }

  releaseForRetry(id: string, nextAttemptAt: Date) {
    return this.db.tareaRevocacionVideo.updateMany({
      where: { id, estado: EstadoTareaRevocacionVideo.EN_PROCESO },
      data: {
        estado: EstadoTareaRevocacionVideo.PENDIENTE,
        proximoIntentoEn: nextAttemptAt,
      },
    });
  }
}
