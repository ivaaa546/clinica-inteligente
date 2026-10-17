import { Prisma, PrismaClient } from "@prisma/client";
import { AuditRepository } from "./audit.repository.js";

type DbClient = PrismaClient | Prisma.TransactionClient;
type AuditDetail = Record<string, string | number | boolean | null>;

const forbiddenDetailKey = /(password|contrasena|hash|nota|observacion|diagnostico|signo|antecedente)/i;

// Un evento de auditoria identifica la accion sin almacenar contenido clinico.
export type AuditEvent = {
  usuarioId: string;
  accion: string;
  entidad: string;
  entidadId: string;
  detalle?: AuditDetail;
};

export class AuditService {
  private readonly repository: AuditRepository;

  constructor(db: DbClient) {
    this.repository = new AuditRepository(db);
  }

  // Si recibe un TransactionClient, el evento queda confirmado junto con la operacion de dominio.
  record(event: AuditEvent) {
    const detail = this.serializeSafeDetail(event.detalle);

    return this.repository.create({
      usuarioId: event.usuarioId,
      accion: event.accion,
      entidad: event.entidad,
      entidadId: event.entidadId,
      detalle: detail,
    });
  }

  // Rechaza detalles sensibles antes de enviarlos al repositorio de solo escritura.
  private serializeSafeDetail(detail?: AuditDetail) {
    if (!detail) {
      return undefined;
    }

    const unsafeKey = Object.keys(detail).find((key) => forbiddenDetailKey.test(key));
    if (unsafeKey) {
      throw new Error(`El detalle de auditoria no puede incluir el campo ${unsafeKey}`);
    }

    return JSON.stringify(detail);
  }
}
