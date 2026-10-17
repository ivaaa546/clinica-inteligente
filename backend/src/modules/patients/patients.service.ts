import { Prisma, PrismaClient } from "@prisma/client";
import { AppointmentsRepository } from "../appointments/appointments.repository.js";
import { AuditService } from "../audit/audit.service.js";
import { DoctorsRepository } from "../doctors/doctors.repository.js";
import { BackgroundRepository } from "./background.repository.js";
import { PatientsRepository } from "./patients.repository.js";

export type PatientProfileInput = {
  direccion?: string;
  ocupacion?: string;
  nombreResponsable?: string;
};

export type GeneralBackgroundInput = {
  medicos?: Prisma.InputJsonValue;
  quirurgicos?: string;
  familiares?: Prisma.InputJsonValue;
  habitos?: Prisma.InputJsonValue;
  alergias: string;
};

export type GynecologicalBackgroundInput = {
  fur?: Date;
  gestas?: number;
  partos?: number;
  cesareas?: number;
  abortos?: number;
  hijosVivos?: number;
  planificacion?: string;
};

export class PatientsService {
  constructor(private readonly db: PrismaClient) {}

  // El perfil propio se resuelve por la cuenta autenticada, no por un id enviado por el cliente.
  getOwnProfile(userId: string) {
    return new PatientsRepository(this.db).findByUserId(userId);
  }

  updateOwnProfile(userId: string, input: PatientProfileInput) {
    return new PatientsRepository(this.db).findByUserId(userId).then((patient) => {
      if (!patient) {
        throw new Error("Perfil de paciente no encontrado");
      }

      return new PatientsRepository(this.db).updateProfile(patient.id, input);
    });
  }

  async getAuthorizedRecord(doctorUserId: string, patientId: string) {
    // La relacion se valida antes de consultar cualquier dato del expediente.
    await this.assertDoctorRelationship(doctorUserId, patientId);
    return new PatientsRepository(this.db).findRecord(patientId);
  }

  async getBackground(doctorUserId: string, patientId: string) {
    await this.assertDoctorRelationship(doctorUserId, patientId);
    return new BackgroundRepository(this.db).findByPatientId(patientId);
  }

  async updateBackground(
    doctorUserId: string,
    patientId: string,
    general: GeneralBackgroundInput,
    gynecological?: GynecologicalBackgroundInput,
  ) {
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

  private async assertDoctorRelationship(doctorUserId: string, patientId: string) {
    // Tener rol de medico no basta: debe existir una cita con el paciente solicitado.
    const doctor = await new DoctorsRepository(this.db).findByUserId(doctorUserId);
    if (!doctor) {
      throw new Error("Perfil de medico no encontrado");
    }

    const relationship = await new AppointmentsRepository(this.db).existsDoctorPatientRelationship(
      doctor.id,
      patientId,
    );
    if (!relationship) {
      throw new Error("El medico no tiene una relacion autorizada con el paciente");
    }

    return doctor;
  }
}
