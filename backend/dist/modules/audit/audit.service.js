import { AuditRepository } from "./audit.repository.js";
const forbiddenDetailKey = /(password|contrasena|hash|nota|observacion|diagnostico|signo|antecedente)/i;
export class AuditService {
    repository;
    constructor(db) {
        this.repository = new AuditRepository(db);
    }
    // Si recibe un TransactionClient, el evento queda confirmado junto con la operacion de dominio.
    record(event) {
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
    serializeSafeDetail(detail) {
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
//# sourceMappingURL=audit.service.js.map