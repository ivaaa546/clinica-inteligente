import { EstadoCita, Prisma, PrismaClient, RolUsuario } from "@prisma/client";
import { AuditService } from "../audit/audit.service.js";
import { AvailabilityRepository } from "../availability/availability.repository.js";
import { DoctorsRepository } from "../doctors/doctors.repository.js";
import { PatientsRepository } from "../patients/patients.repository.js";
import { AppointmentsRepository } from "./appointments.repository.js";

export class AppointmentsService {
  constructor(private readonly db: PrismaClient) {}

  async request(patientUserId: string, medicoId: string, disponibilidadId: string) {
    try {
      return await this.db.$transaction(async (transaction) => {
        const patients = new PatientsRepository(transaction);
        const availability = new AvailabilityRepository(transaction);
        const appointments = new AppointmentsRepository(transaction);
        const patient = await patients.findByUserId(patientUserId);
        const block = await availability.findById(disponibilidadId);

        if (!patient || !block || !block.activa || block.medicoId !== medicoId || block.inicio <= new Date()) {
          throw new Error("El bloque de disponibilidad no esta disponible");
        }

        if (await appointments.findActiveByAvailability(disponibilidadId)) {
          throw new Error("El bloque de disponibilidad ya esta reservado");
        }

        const appointment = await appointments.create({
          pacienteId: patient.id,
          medicoId,
          disponibilidadId,
          inicio: block.inicio,
          fin: block.fin,
          estado: "PENDIENTE",
        });

        // La auditoria usa el mismo cliente transaccional que la reserva.
        await new AuditService(transaction).record({
          usuarioId: patientUserId,
          accion: "CITA_SOLICITADA",
          entidad: "Cita",
          entidadId: appointment.id,
          detalle: { estado: "PENDIENTE" },
        });

        return appointment;
      });
    } catch (error) {
      // El indice unico parcial es la garantia final ante dos solicitudes simultaneas.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new Error("El bloque de disponibilidad ya esta reservado");
      }
      throw error;
    }
  }

  async listForPatient(userId: string, estado?: EstadoCita) {
    const patient = await new PatientsRepository(this.db).findByUserId(userId);
    if (!patient) {
      throw new Error("Perfil de paciente no encontrado");
    }
    return new AppointmentsRepository(this.db).listByPatient(patient.id, estado);
  }

  async listForDoctor(userId: string, estado?: EstadoCita) {
    const doctor = await new DoctorsRepository(this.db).findByUserId(userId);
    if (!doctor) {
      throw new Error("Perfil de medico no encontrado");
    }
    return new AppointmentsRepository(this.db).listByDoctor(doctor.id, estado);
  }

  getById(id: string) {
    return new AppointmentsRepository(this.db).findById(id);
  }

  async getForActor(actor: { userId: string; role: RolUsuario }, id: string) {
    const appointment = await this.authorizeActorAppointment(actor, id);

    // La autorización de relación se resuelve antes de proyectar. Cada rol recibe
    // únicamente los datos necesarios, en vez de depender de que el cliente oculte campos.
    if (actor.role === RolUsuario.PACIENTE) {
      return {
        id: appointment.id,
        medicoId: appointment.medicoId,
        disponibilidadId: appointment.disponibilidadId,
        inicio: appointment.inicio,
        fin: appointment.fin,
        estado: appointment.estado,
        citaOrigenId: appointment.citaOrigenId,
        creadoEn: appointment.creadoEn,
        actualizadoEn: appointment.actualizadoEn,
        preconsulta: appointment.preconsulta && {
          id: appointment.preconsulta.id,
          citaId: appointment.preconsulta.citaId,
          motivoConsulta: appointment.preconsulta.motivoConsulta,
          antecedentesIniciales: appointment.preconsulta.antecedentesIniciales,
        },
        consulta: appointment.consulta && { diagnostico: appointment.consulta.diagnostico },
      };
    }

    if (actor.role === RolUsuario.ADMINISTRADOR) {
      return {
        id: appointment.id,
        pacienteId: appointment.pacienteId,
        medicoId: appointment.medicoId,
        disponibilidadId: appointment.disponibilidadId,
        inicio: appointment.inicio,
        fin: appointment.fin,
        estado: appointment.estado,
        citaOrigenId: appointment.citaOrigenId,
        creadoEn: appointment.creadoEn,
        actualizadoEn: appointment.actualizadoEn,
      };
    }

    // El médico ya fue autorizado por relación y conserva la vista clínica prevista.
    return appointment;
  }

  async accept(doctorUserId: string, appointmentId: string) {
    const appointment = await this.authorizeDoctorAppointment(doctorUserId, appointmentId);
    this.assertState(appointment.estado, ["PENDIENTE"]);
    this.assertFuture(appointment.inicio);
    return this.changeState(doctorUserId, appointmentId, "ACEPTADA", "CITA_ACEPTADA");
  }

  async reject(doctorUserId: string, appointmentId: string) {
    const appointment = await this.authorizeDoctorAppointment(doctorUserId, appointmentId);
    this.assertState(appointment.estado, ["PENDIENTE"]);
    this.assertFuture(appointment.inicio);
    return this.changeState(doctorUserId, appointmentId, "RECHAZADA", "CITA_RECHAZADA");
  }

  async cancel(actor: { userId: string; role: RolUsuario }, appointmentId: string) {
    const appointment = await this.authorizeActorAppointment(actor, appointmentId);
    this.assertState(appointment.estado, ["PENDIENTE", "ACEPTADA"]);
    this.assertFuture(appointment.inicio);
    return this.changeState(actor.userId, appointmentId, "CANCELADA", "CITA_CANCELADA");
  }

  async reschedule(
    actor: { userId: string; role: RolUsuario },
    appointmentId: string,
    newAvailabilityId: string,
  ) {
    const appointment = await this.authorizeActorAppointment(actor, appointmentId);
    this.assertState(appointment.estado, ["PENDIENTE", "ACEPTADA"]);
    this.assertFuture(appointment.inicio);

    try {
      return await this.db.$transaction(async (transaction) => {
        const appointments = new AppointmentsRepository(transaction);
        const availability = await new AvailabilityRepository(transaction).findById(newAvailabilityId);

        if (!availability || !availability.activa || availability.medicoId !== appointment.medicoId) {
          throw new Error("El nuevo bloque no esta disponible para este medico");
        }
        if (availability.inicio <= new Date()) {
          throw new Error("El nuevo bloque debe ser futuro");
        }
        if (await appointments.findActiveByAvailability(newAvailabilityId)) {
          throw new Error("El nuevo bloque ya esta reservado");
        }

        await appointments.updateState(appointmentId, "REPROGRAMADA");
        const replacement = await appointments.createRescheduled({
          pacienteId: appointment.pacienteId,
          medicoId: appointment.medicoId,
          disponibilidadId: availability.id,
          inicio: availability.inicio,
          fin: availability.fin,
          estado: "PENDIENTE",
          citaOrigenId: appointment.id,
        });

        // La cita anterior y la nueva quedan trazadas dentro de una sola transaccion.
        await new AuditService(transaction).record({
          usuarioId: actor.userId,
          accion: "CITA_REPROGRAMADA",
          entidad: "Cita",
          entidadId: appointment.id,
          detalle: { nuevaCitaId: replacement.id },
        });

        return replacement;
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new Error("El nuevo bloque ya esta reservado");
      }
      throw error;
    }
  }

  private async authorizeDoctorAppointment(userId: string, appointmentId: string) {
    const doctor = await new DoctorsRepository(this.db).findByUserId(userId);
    const appointment = await new AppointmentsRepository(this.db).findById(appointmentId);
    if (!doctor || !appointment || appointment.medicoId !== doctor.id) {
      throw new Error("La cita no pertenece al medico");
    }
    return appointment;
  }

  private async authorizeActorAppointment(
    actor: { userId: string; role: RolUsuario },
    appointmentId: string,
  ) {
    const appointment = await new AppointmentsRepository(this.db).findById(appointmentId);
    if (!appointment) {
      throw new Error("Cita no encontrada");
    }
    if (actor.role === RolUsuario.ADMINISTRADOR) {
      return appointment;
    }
    if (actor.role === RolUsuario.PACIENTE) {
      const patient = await new PatientsRepository(this.db).findByUserId(actor.userId);
      if (patient?.id === appointment.pacienteId) return appointment;
    }
    if (actor.role === RolUsuario.MEDICO) {
      const doctor = await new DoctorsRepository(this.db).findByUserId(actor.userId);
      if (doctor?.id === appointment.medicoId) return appointment;
    }
    throw new Error("El usuario no puede gestionar esta cita");
  }

  private changeState(userId: string, appointmentId: string, state: EstadoCita, action: string) {
    return this.db.$transaction(async (transaction) => {
      const appointment = await new AppointmentsRepository(transaction).updateState(appointmentId, state);
      await new AuditService(transaction).record({
        usuarioId: userId,
        accion: action,
        entidad: "Cita",
        entidadId: appointmentId,
        detalle: { estado: state },
      });
      return appointment;
    });
  }

  private assertState(current: EstadoCita, allowed: EstadoCita[]) {
    if (!allowed.includes(current)) {
      throw new Error("La transicion de estado de la cita no esta permitida");
    }
  }

  private assertFuture(date: Date) {
    if (date <= new Date()) {
      throw new Error("La cita ya no es futura");
    }
  }
}
