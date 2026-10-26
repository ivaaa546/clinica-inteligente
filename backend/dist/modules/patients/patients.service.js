import { AppointmentsRepository } from "../appointments/appointments.repository.js";
import { AuditService } from "../audit/audit.service.js";
import { DoctorsRepository } from "../doctors/doctors.repository.js";
import { BackgroundRepository } from "./background.repository.js";
import { PatientsRepository } from "./patients.repository.js";
export class PatientsService {
    db;
    constructor(db) {
        this.db = db;
    }
    // El perfil propio se resuelve por la cuenta autenticada, no por un id enviado por el cliente.
    getOwnProfile(userId) {
        return new PatientsRepository(this.db).findByUserId(userId);
    }
    updateOwnProfile(userId, input) {
        return new PatientsRepository(this.db).findByUserId(userId).then((patient) => {
            if (!patient) {
                throw new Error("Perfil de paciente no encontrado");
            }
            return new PatientsRepository(this.db).updateProfile(patient.id, input);
        });
    }
    async getAuthorizedRecord(doctorUserId, patientId) {
        // La relacion se valida antes de consultar cualquier dato del expediente.
        await this.assertDoctorRelationship(doctorUserId, patientId);
        return new PatientsRepository(this.db).findRecord(patientId);
    }
    async getBackground(doctorUserId, patientId) {
        await this.assertDoctorRelationship(doctorUserId, patientId);
        return new BackgroundRepository(this.db).findByPatientId(patientId);
    }
    async updateBackground(doctorUserId, patientId, general, gynecological) {
        const doctor = await this.assertDoctorRelationship(doctorUserId, patientId);
        // Antecedentes y auditoria deben confirmarse juntos para mantener trazabilidad.
        return this.db.$transaction(async (transaction) => {
            const backgrounds = new BackgroundRepository(transaction);
            const updatedGeneral = await backgrounds.upsertGeneral({ pacienteId: patientId, ...general });
            const updatedGynecological = gynecological
                ? await backgrounds.upsertGineco({ pacienteId: patientId, ...gynecological })
                : undefined;
            // Solo se audita la accion y no el contenido clinico modificado.
            await new AuditService(transaction).record({
                usuarioId: doctor.usuarioId,
                accion: "ANTECEDENTES_ACTUALIZADOS",
                entidad: "Paciente",
                entidadId: patientId,
                detalle: { campos: "antecedentes" },
            });
            return { general: updatedGeneral, gynecological: updatedGynecological };
        });
    }
    async assertDoctorRelationship(doctorUserId, patientId) {
        // Tener rol de medico no basta: debe existir una cita con el paciente solicitado.
        const doctor = await new DoctorsRepository(this.db).findByUserId(doctorUserId);
        if (!doctor) {
            throw new Error("Perfil de medico no encontrado");
        }
        const relationship = await new AppointmentsRepository(this.db).existsDoctorPatientRelationship(doctor.id, patientId);
        if (!relationship) {
            throw new Error("El medico no tiene una relacion autorizada con el paciente");
        }
        return doctor;
    }
}
//# sourceMappingURL=patients.service.js.map