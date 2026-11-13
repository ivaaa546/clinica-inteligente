import {
  CausaRevocacionVideo,
  EstadoTareaRevocacionVideo,
  Prisma,
  PrismaClient,
} from "@prisma/client";

type DbClient = PrismaClient | Prisma.TransactionClient;

// La tabla tiene un indice unico parcial; estas operaciones conservan esa invariante
// aun cuando mas de un procesador intente reclamar trabajo al mismo tiempo.
export class VideoRevocationRepository {
  constructor(private readonly db: DbClient) {}

  async enqueue(citaId: string, causa: CausaRevocacionVideo, now = new Date()) {
    try {
      return await this.db.tareaRevocacionVideo.create({
        data: { citaId, causa, proximoIntentoEn: now },
      });
    } catch (error) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") throw error;
      return this.db.tareaRevocacionVideo.findFirstOrThrow({
        where: { citaId, causa, estado: { in: ["PENDIENTE", "EN_PROCESO"] } },
      });
    }
  }

  // Reclamo optimista: si dos consumidores eligen la misma tarea, solo uno cambia su estado.
  async claimNext(now = new Date()) {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const task = await this.db.tareaRevocacionVideo.findFirst({
        where: { estado: "PENDIENTE", proximoIntentoEn: { lte: now } },
        orderBy: [{ proximoIntentoEn: "asc" }, { creadoEn: "asc" }],
      });
      if (!task) return null;
      const claimed = await this.db.tareaRevocacionVideo.updateMany({
        where: { id: task.id, estado: "PENDIENTE", proximoIntentoEn: { lte: now } },
        data: { estado: "EN_PROCESO", intentos: { increment: 1 } },
      });
      if (claimed.count === 1) return this.db.tareaRevocacionVideo.findUnique({ where: { id: task.id } });
    }
    return null;
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
