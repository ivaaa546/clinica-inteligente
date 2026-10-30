import { PrismaClient } from "@prisma/client";
import { AppointmentsRepository } from "../appointments/appointments.repository.js";
import { VideoRevocationRepository } from "./video-revocation.repository.js";
import { VideoRevocationProcessor } from "./video-revocation.processor.js";

// Puede ejecutarse periódicamente; la base conserva el trabajo pendiente entre reinicios.
export class VideoWindowCloser {
  constructor(
    private readonly db: PrismaClient,
    private readonly processor: VideoRevocationProcessor,
  ) {}

  async run(now = new Date()) {
    const expired = await new AppointmentsRepository(this.db).listExpiredAcceptedVirtual(now);
    for (const appointment of expired) {
      await this.db.$transaction(async (transaction) => {
        const appointments = new AppointmentsRepository(transaction);
        await appointments.markVideoRevoked(appointment.id, now);
        await new VideoRevocationRepository(transaction).enqueue(appointment.id, "FIN_VENTANA", now);
      });
    }

    let processed = 0;
    while (await this.processor.processNext(now)) processed += 1;
    return { enqueued: expired.length, processed };
  }
}
