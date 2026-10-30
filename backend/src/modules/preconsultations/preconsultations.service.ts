import { Prisma, PrismaClient } from "@prisma/client";
import { AppointmentsRepository } from "../appointments/appointments.repository.js";
import { AuditService } from "../audit/audit.service.js";
import { ConsultationsRepository } from "../consultations/consultations.repository.js";
import { DoctorsRepository } from "../doctors/doctors.repository.js";
import { PatientsRepository } from "../patients/patients.repository.js";
import { PreconsultationsRepository } from "./preconsultations.repository.js";

export type PreconsultationInput = {
  motivoConsulta: string;
  antecedentesIniciales?: Prisma.InputJsonValue;
  signosVitales?: Prisma.InputJsonValue;
};

export class PreconsultationsService {
  constructor(private readonly db: PrismaClient) {}

  async create(patientUserId: string, citaId: string, input: PreconsultationInput) {
    const appointment = await this.authorizePatientAppointment(patientUserId, citaId);
    await this.assertNotCompleted(citaId);

    const preconsultation = await new PreconsultationsRepository(this.db).create({
      citaId: appointment.id,
      motivoConsulta: input.motivoConsulta,
      antecedentesIniciales: input.antecedentesIniciales,
      signosVitales: input.signosVitales,
    });

    await new AuditService(this.db).record({
      usuarioId: patientUserId,
      accion: "PRECONSULTA_CREADA",
      entidad: "Preconsulta",
      entidadId: preconsultation.id,
    });

    return preconsultation;
  }

  async update(patientUserId: string, id: string, input: PreconsultationInput) {
    const preconsultation = await new PreconsultationsRepository(this.db).findById(id);
    if (!preconsultation) {
      throw new Error("Preconsulta no encontrada");
    }

    await this.authorizePatientAppointment(patientUserId, preconsultation.citaId);
    await this.assertNotCompleted(preconsultation.citaId);
    const updated = await new PreconsultationsRepository(this.db).update(id, input);

    await new AuditService(this.db).record({
      usuarioId: patientUserId,
      accion: "PRECONSULTA_ACTUALIZADA",
      entidad: "Preconsulta",
      entidadId: id,
      detalle: { campos: "preconsulta" },
    });

    return updated;
  }

  async getForDoctor(doctorUserId: string, citaId: string) {
    const doctor = await new DoctorsRepository(this.db).findByUserId(doctorUserId);
    const appointment = await new AppointmentsRepository(this.db).findById(citaId);
    if (!doctor || !appointment || appointment.medicoId !== doctor.id) {
      throw new Error("El medico no esta autorizado para esta cita");
    }

    return new PreconsultationsRepository(this.db).findByAppointment(citaId);
  }

  private async authorizePatientAppointment(patientUserId: string, citaId: string) {
    const patient = await new PatientsRepository(this.db).findByUserId(patientUserId);
    const appointment = await new AppointmentsRepository(this.db).findById(citaId);
    if (!patient || !appointment || appointment.pacienteId !== patient.id) {
      throw new Error("La cita no pertenece al paciente");
    }
    if (!["PENDIENTE", "ACEPTADA"].includes(appointment.estado)) {
      throw new Error("La preconsulta no puede modificarse en este estado");
    }
    return appointment;
  }

  private async assertNotCompleted(citaId: string) {
    const consultation = await new ConsultationsRepository(this.db).findByAppointment(citaId);
    if (consultation) {
      throw new Error("La preconsulta esta bloqueada porque la consulta ya fue registrada");
    }
  }
}
