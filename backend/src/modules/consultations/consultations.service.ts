import {
  EstadoSignoVital,
  ModalidadAtencion,
  Prisma,
  PrismaClient,
  TipoFichaClinica,
} from "@prisma/client";
import { z } from "zod";
import { AppointmentsRepository } from "../appointments/appointments.repository.js";
import { AuditService } from "../audit/audit.service.js";
import { DoctorsRepository } from "../doctors/doctors.repository.js";
import { VideoRevocationRepository } from "../video-calls/video-revocation.repository.js";
import { PrescriptionsRepository } from "../prescriptions/prescriptions.repository.js";
import { PatientsRepository } from "../patients/patients.repository.js";
import { ConsultationsRepository } from "./consultations.repository.js";

type VitalSignInput<T> = T | { estado?: EstadoSignoVital; valor?: T | null };

export type ConsultationInput = {
  citaId: string;
  tipoFicha: TipoFichaClinica;
  motivoConsulta: string;
  historiaActual?: string;
  evaluacionClinica?: Prisma.InputJsonValue;
  diagnostico: string;
  observaciones?: string;
  signosVitales?: {
    pesoLb?: VitalSignInput<number>;
    tallaCm?: VitalSignInput<number>;
    temperatura?: VitalSignInput<number>;
    presionArterial?: VitalSignInput<string>;
    frecCardiaca?: VitalSignInput<number>;
    frecRespiratoria?: VitalSignInput<number>;
  };
  recetas: Array<{
    medicamento: string;
    dosis: string;
    via: string;
    frecuencia: string;
    duracion: string;
    indicaciones: string;
  }>;
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

      const vitalSigns = appointment.modalidad === ModalidadAtencion.VIRTUAL
        ? this.virtualVitalSigns(appointment.preconsulta?.signosVitales, appointment.lecturaSignosVitales?.frecCardiaca)
        : input.signosVitales;

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
        ...this.normalizeVitalSigns(vitalSigns),
      });
      const prescriptions = new PrescriptionsRepository(transaction);
      for (const receta of input.recetas) {
        const created = await prescriptions.create({ consultaId: consultation.id, ...receta });
        await new AuditService(transaction).record({
          usuarioId: doctorUserId,
          accion: "RECETA_CREADA",
          entidad: "Receta",
          entidadId: created.id,
        });
      }
      const completedAppointment = await appointments.updateState(input.citaId, "COMPLETADA");
      if (completedAppointment.modalidad === ModalidadAtencion.VIRTUAL) {
        const now = new Date();
        await appointments.markVideoRevoked(input.citaId, now);
        await new VideoRevocationRepository(transaction).enqueue(input.citaId, "CITA_COMPLETADA", now);
      }

      // Consulta, signos, estado, revocacion y auditoria se confirman como una sola operacion.
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

  private normalizeVitalSigns(signs: ConsultationInput["signosVitales"]) {
    return {
      ...this.normalizeVitalSign(signs?.pesoLb, "pesoLb", (value) => this.validNumber(value, 0.1, 999.99)),
      ...this.normalizeVitalSign(signs?.tallaCm, "tallaCm", (value) => this.validNumber(value, 1, 300)),
      ...this.normalizeVitalSign(signs?.temperatura, "temperatura", (value) => this.validNumber(value, 20, 50)),
      ...this.normalizeVitalSign(signs?.presionArterial, "presionArterial", (value) => /^\d{2,3}\/\d{2,3}$/.test(value)),
      ...this.normalizeVitalSign(signs?.frecCardiaca, "frecCardiaca", (value) => this.validNumber(value, 1, 300, true)),
      ...this.normalizeVitalSign(signs?.frecRespiratoria, "frecRespiratoria", (value) => this.validNumber(value, 1, 150, true)),
    };
  }

  private virtualVitalSigns(preconsultationSigns: Prisma.JsonValue | null | undefined, heartRate?: number | null) {
    if (heartRate == null) {
      throw new Error("La frecuencia cardiaca del dispositivo es obligatoria para completar la consulta virtual");
    }
    const declared = preconsultationSigns && typeof preconsultationSigns === "object" && !Array.isArray(preconsultationSigns)
      ? preconsultationSigns as Prisma.JsonObject
      : {};
    const height = declared.tallaCm;
    return {
      ...(typeof height === "number" && Number.isFinite(height)
        ? { tallaCm: { estado: EstadoSignoVital.AUTORREPORTADO, valor: height } }
        : {}),
      frecCardiaca: { estado: EstadoSignoVital.MEDIDO, valor: heartRate },
    } satisfies ConsultationInput["signosVitales"];
  }

  private normalizeVitalSign<T extends number | string>(
    input: VitalSignInput<T> | undefined,
    field: string,
    isValid: (value: T) => boolean,
  ) {
    const state = typeof input === "object" && input !== null ? input.estado ?? EstadoSignoVital.MEDIDO : input === undefined ? EstadoSignoVital.NO_MEDIDO : EstadoSignoVital.MEDIDO;
    const value = typeof input === "object" && input !== null ? input.valor : input;
    if (state === EstadoSignoVital.NO_MEDIDO) {
      if (value !== undefined && value !== null) throw new Error(`${field} no puede tener valor si no fue medido`);
      return { [field]: null, [`${field}Estado`]: state };
    }
    if (value === undefined || value === null || !isValid(value)) {
      throw new Error(`${field} tiene un formato incompatible con su estado`);
    }
    return { [field]: value, [`${field}Estado`]: state };
  }

  private validNumber(value: number, min: number, max: number, integer = false) {
    return Number.isFinite(value) && value >= min && value <= max && (!integer || Number.isInteger(value));
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

  async listForPatient(patientUserId: string) {
    const patient = await new PatientsRepository(this.db).findByUserId(patientUserId);
    if (!patient) throw new Error("Perfil de paciente no encontrado");
    // Proyección segura: no expone observaciones internas ni evaluación clínica del médico.
    return new ConsultationsRepository(this.db).listSafeByPatient(patient.id);
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
