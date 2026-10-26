import { AuditService } from "../audit/audit.service.js";
import { ConsultationsRepository } from "../consultations/consultations.repository.js";
import { DoctorsRepository } from "../doctors/doctors.repository.js";
import { PatientsRepository } from "../patients/patients.repository.js";
import { PrescriptionsRepository } from "./prescriptions.repository.js";
export class PrescriptionsService {
    db;
    constructor(db) {
        this.db = db;
    }
    async create(doctorUserId, input) {
        const doctor = await new DoctorsRepository(this.db).findByUserId(doctorUserId);
        const consultation = await new ConsultationsRepository(this.db).findById(input.consultaId);
        if (!doctor || !consultation || consultation.cita.medicoId !== doctor.id) {
            throw new Error("El medico no esta autorizado para esta consulta");
        }
        const prescription = await new PrescriptionsRepository(this.db).create(input);
        await new AuditService(this.db).record({
            usuarioId: doctorUserId,
            accion: "RECETA_CREADA",
            entidad: "Receta",
            entidadId: prescription.id,
        });
        return prescription;
    }
    async listForDoctor(doctorUserId, consultaId) {
        const doctor = await new DoctorsRepository(this.db).findByUserId(doctorUserId);
        const consultation = await new ConsultationsRepository(this.db).findById(consultaId);
        if (!doctor || !consultation || consultation.cita.medicoId !== doctor.id) {
            throw new Error("El medico no esta autorizado para esta consulta");
        }
        return new PrescriptionsRepository(this.db).listByConsultation(consultaId);
    }
    async listForPatient(patientUserId) {
        const patient = await new PatientsRepository(this.db).findByUserId(patientUserId);
        if (!patient) {
            throw new Error("Perfil de paciente no encontrado");
        }
        // La consulta del paciente nunca incluye signos vitales ni observaciones internas.
        return new PrescriptionsRepository(this.db).listForPatient(patient.id);
    }
}
//# sourceMappingURL=prescriptions.service.js.map