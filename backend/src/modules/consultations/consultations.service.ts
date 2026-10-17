import { Prisma, PrismaClient, TipoFichaClinica } from "@prisma/client";
import { z } from "zod";
import { AppointmentsRepository } from "../appointments/appointments.repository.js";
import { AuditService } from "../audit/audit.service.js";
import { DoctorsRepository } from "../doctors/doctors.repository.js";
import { ConsultationsRepository } from "./consultations.repository.js";

export type ConsultationInput = {
  citaId: string;
  tipoFicha: TipoFichaClinica;
  motivoConsulta: string;
  historiaActual?: string;
  evaluacionClinica?: Prisma.InputJsonValue;
  diagnostico: string;
  observaciones?: string;
  signosVitales: {
    pesoLb: number;
    tallaCm: number;
    temperatura: number;
    presionArterial: string;
    frecCardiaca: number;
    frecRespiratoria: number;
  };
};

const evaluationSchemas = {
  ADULTO: z.object({
    problemas_activos: z.array(z.string()),
    signos_peligro: z.array(z.string()),
  }),
  PRENATAL: z.object({
    semanas_gestacion: z.number(),
    posicion_fetal: z.string(),
    presentacion: z.string(),
    signos_peligro: z.array(z.string()),
  }),
  NEONATO: z.object({
    peso_nacer_g: z.number(),
    apgar_1min: z.number(),
    apgar_5min: z.number(),
    edad_gestacional_semanas: z.number(),
    signos_peligro: z.array(z.string()),
  }),
} as const;

export class ConsultationsService {
  constructor(private readonly db: PrismaClient) {}

  async register(doctorUserId: string, input: ConsultationInput) {
    const doctor = await new DoctorsRepository(this.db).findByUserId(doctorUserId);
    if (!doctor) {
      throw new Error("Perfil de medico no encontrado");
    }

    const evaluation = this.validateEvaluation(input.tipoFicha, input.evaluacionClinica);

    return this.db.$transaction(async (transaction) => {
      const appointments = new AppointmentsRepository(transaction);
      const consultations = new ConsultationsRepository(transaction);
      const appointment = await appointments.findById(input.citaId);

      if (!appointment || appointment.medicoId !== doctor.id) {
        throw new Error("La cita no pertenece al medico");
      }
      if (appointment.estado !== "ACEPTADA") {
        throw new Error("La consulta solo puede registrarse para una cita aceptada");
      }
      if (await consultations.findByAppointment(input.citaId)) {
        throw new Error("La cita ya tiene una consulta registrada");
      }

      const consultation = await consultations.create({
        citaId: input.citaId,
        tipoFicha: input.tipoFicha,
        motivoConsulta: input.motivoConsulta,
        historiaActual: input.historiaActual,
        evaluacionClinica: evaluation,
        diagnostico: input.diagnostico,
        observaciones: input.observaciones,
        fechaConsulta: new Date(),
      });

      await consultations.createVitalSigns({
        consultaId: consultation.id,
        ...input.signosVitales,
      });
      await appointments.updateState(input.citaId, "COMPLETADA");

      // Consulta, signos, estado y auditoria se confirman como una sola operacion.
      await new AuditService(transaction).record({
        usuarioId: doctorUserId,
        accion: "CONSULTA_CREADA",
        entidad: "Consulta",
        entidadId: consultation.id,
        detalle: { tipoFicha: input.tipoFicha },
      });

      return consultations.findById(consultation.id);
    });
  }

  private validateEvaluation(type: TipoFichaClinica, evaluation?: Prisma.InputJsonValue) {
    if (evaluation === undefined) {
      return undefined;
    }

    const result = evaluationSchemas[type].safeParse(evaluation);
    if (!result.success) {
      throw new Error(`La evaluacion clinica no cumple el contrato de la ficha ${type}`);
    }
    return result.data;
  }

  getById(doctorUserId: string, id: string) {
    return this.authorizeDoctorConsultation(doctorUserId, id);
  }

  async getByAppointment(doctorUserId: string, citaId: string) {
    const doctor = await new DoctorsRepository(this.db).findByUserId(doctorUserId);
    const appointment = await new AppointmentsRepository(this.db).findById(citaId);
    if (!doctor || !appointment || appointment.medicoId !== doctor.id) {
      throw new Error("El medico no esta autorizado para esta cita");
    }
    return new ConsultationsRepository(this.db).findByAppointment(citaId);
  }

  private async authorizeDoctorConsultation(doctorUserId: string, id: string) {
    const consultation = await new ConsultationsRepository(this.db).findById(id);
    const doctor = await new DoctorsRepository(this.db).findByUserId(doctorUserId);
    if (!consultation || !doctor || consultation.cita.medicoId !== doctor.id) {
      throw new Error("El medico no esta autorizado para esta consulta");
    }
    return consultation;
  }
}
