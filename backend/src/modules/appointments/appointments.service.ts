import { randomUUID } from "node:crypto";
import { EstadoCita, ModalidadAtencion, Prisma, PrismaClient, RolUsuario } from "@prisma/client";
import { AuditService } from "../audit/audit.service.js";
import { AvailabilityRepository } from "../availability/availability.repository.js";
import { DoctorsRepository } from "../doctors/doctors.repository.js";
import { PatientsRepository } from "../patients/patients.repository.js";
import { VideoRevocationRepository } from "../video-calls/video-revocation.repository.js";
import { AppointmentsRepository } from "./appointments.repository.js";

export class AppointmentsService {
  constructor(private readonly db: PrismaClient) {}

  async request(
    patientUserId: string,
    medicoId: string,
    disponibilidadId: string,
    modalidad: ModalidadAtencion = ModalidadAtencion.PRESENCIAL,
  ) {
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
        if (!block.modalidades.includes(modalidad)) {
          throw new Error("La modalidad no esta habilitada para este bloque");
        }

        const doctor = await new DoctorsRepository(transaction).findById(medicoId);
        const direccionAtencionPresencial = this.attendanceAddress(modalidad, doctor?.direccionAtencionPresencial);
        const appointment = await appointments.create({
          pacienteId: patient.id,
          medicoId,
          disponibilidadId,
          inicio: block.inicio,
          fin: block.fin,
          estado: "ACEPTADA",
          modalidad,
          direccionAtencionPresencial,
          direccionPresencialEsLegado: false,
          salaVideoId: modalidad === ModalidadAtencion.VIRTUAL ? this.videoRoomId() : null,
        });

        // La auditoria usa el mismo cliente transaccional que la reserva.
        await new AuditService(transaction).record({
          usuarioId: patientUserId,
          accion: "CITA_SOLICITADA",
          entidad: "Cita",
          entidadId: appointment.id,
          detalle: { estado: "ACEPTADA", modalidad },
        });
        await new AuditService(transaction).record({
          usuarioId: patientUserId,
          accion: "MODALIDAD_CITA_SELECCIONADA",
          entidad: "Cita",
          entidadId: appointment.id,
          detalle: { modalidad },
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
    const appointments = await new AppointmentsRepository(this.db).listByDoctor(doctor.id, estado);
    return appointments.map((appointment) => ({
      id: appointment.id,
      disponibilidadId: appointment.disponibilidadId,
      inicio: appointment.inicio,
      fin: appointment.fin,
      estado: appointment.estado,
      modalidad: appointment.modalidad,
      paciente: {
        id: appointment.paciente.id,
        nombre: appointment.paciente.usuario.nombre,
        apellidos: appointment.paciente.usuario.apellidos,
        telefono: appointment.paciente.usuario.telefono,
      },
      consultaId: appointment.consulta?.id ?? null,
    }));
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
        modalidad: appointment.modalidad,
        ...(appointment.modalidad === ModalidadAtencion.PRESENCIAL
          ? { direccionAtencionPresencial: appointment.direccionAtencionPresencial }
          : {}),
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
        modalidad: appointment.modalidad,
        citaOrigenId: appointment.citaOrigenId,
        creadoEn: appointment.creadoEn,
        actualizadoEn: appointment.actualizadoEn,
      };
    }

    // El médico conserva la vista clínica prevista, sin identificadores operativos de sala.
    const { salaVideoId: _salaVideoId, videoRevocadaEn: _videoRevocadaEn, ...doctorView } = appointment;
    return {
      ...doctorView,
      ...(appointment.modalidad === ModalidadAtencion.PRESENCIAL
        ? { direccionAtencionPresencial: appointment.direccionAtencionPresencial }
        : { direccionAtencionPresencial: undefined }),
    };
  }

  async accept(doctorUserId: string, appointmentId: string) {
    const appointment = await this.authorizeDoctorAppointment(doctorUserId, appointmentId);
    this.assertState(appointment.estado, ["PENDIENTE"]);
    this.assertFuture(appointment.inicio);
    return this.changeState(doctorUserId, appointmentId, ["PENDIENTE"], "ACEPTADA", "CITA_ACEPTADA");
  }

  async reject(doctorUserId: string, appointmentId: string) {
    const appointment = await this.authorizeDoctorAppointment(doctorUserId, appointmentId);
    this.assertState(appointment.estado, ["PENDIENTE"]);
    this.assertFuture(appointment.inicio);
    return this.changeState(doctorUserId, appointmentId, ["PENDIENTE"], "RECHAZADA", "CITA_RECHAZADA");
  }

  async cancel(actor: { userId: string; role: RolUsuario }, appointmentId: string) {
    const appointment = await this.authorizeActorAppointment(actor, appointmentId);
    this.assertState(appointment.estado, ["PENDIENTE", "ACEPTADA"]);
    this.assertFuture(appointment.inicio);
    return this.changeState(actor.userId, appointmentId, ["PENDIENTE", "ACEPTADA"], "CANCELADA", "CITA_CANCELADA");
  }

  async reschedule(
    actor: { userId: string; role: RolUsuario },
    appointmentId: string,
    newAvailabilityId: string,
    modalidad: ModalidadAtencion = ModalidadAtencion.PRESENCIAL,
  ) {
    const appointment = await this.authorizeActorAppointment(actor, appointmentId);
    this.assertState(appointment.estado, ["PENDIENTE", "ACEPTADA"]);
    this.assertFuture(appointment.inicio);

    try {
      return await this.db.$transaction(async (transaction) => {
        const appointments = new AppointmentsRepository(transaction);
        // Se vuelve a leer dentro de la transacción para no actuar sobre un estado obsoleto.
        const currentAppointment = await appointments.findById(appointmentId);
        if (!currentAppointment || currentAppointment.medicoId !== appointment.medicoId || !["PENDIENTE", "ACEPTADA"].includes(currentAppointment.estado) || currentAppointment.inicio <= new Date()) {
          throw new Error("La cita ya no puede reprogramarse");
        }
        const availability = await new AvailabilityRepository(transaction).findById(newAvailabilityId);

        if (!availability || !availability.activa || availability.medicoId !== currentAppointment.medicoId) {
          throw new Error("El nuevo bloque no esta disponible para este medico");
        }
        if (availability.inicio <= new Date()) {
          throw new Error("El nuevo bloque debe ser futuro");
        }
        if (await appointments.findActiveByAvailability(newAvailabilityId)) {
          throw new Error("El nuevo bloque ya esta reservado");
        }
        if (!availability.modalidades.includes(modalidad)) {
          throw new Error("La modalidad no esta habilitada para el nuevo bloque");
        }

        const doctor = await new DoctorsRepository(transaction).findById(currentAppointment.medicoId);
        const direccionAtencionPresencial = this.attendanceAddress(modalidad, doctor?.direccionAtencionPresencial);
        const changed = await appointments.updateStateIfCurrent(appointmentId, ["PENDIENTE", "ACEPTADA"], "REPROGRAMADA");
        if (!changed) throw new Error("La cita fue modificada por otra solicitud");
        await this.invalidateVirtualAccess(transaction, currentAppointment, "CITA_REPROGRAMADA");
        const replacement = await appointments.createRescheduled({
          pacienteId: currentAppointment.pacienteId,
          medicoId: currentAppointment.medicoId,
          disponibilidadId: availability.id,
          inicio: availability.inicio,
          fin: availability.fin,
          estado: "PENDIENTE",
          citaOrigenId: appointment.id,
          modalidad,
          direccionAtencionPresencial,
          direccionPresencialEsLegado: false,
          salaVideoId: modalidad === ModalidadAtencion.VIRTUAL ? this.videoRoomId() : null,
        });

        // La cita anterior y la nueva quedan trazadas dentro de una sola transaccion.
        await new AuditService(transaction).record({
          usuarioId: actor.userId,
          accion: "CITA_REPROGRAMADA",
          entidad: "Cita",
          entidadId: appointment.id,
          detalle: { nuevaCitaId: replacement.id, modalidad },
        });
        await new AuditService(transaction).record({
          usuarioId: actor.userId,
          accion: "MODALIDAD_CITA_SELECCIONADA",
          entidad: "Cita",
          entidadId: replacement.id,
          detalle: { modalidad },
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

  private attendanceAddress(modalidad: ModalidadAtencion, direccion: string | null | undefined) {
    if (modalidad === ModalidadAtencion.VIRTUAL) return null;
    if (!direccion?.trim()) {
      throw new Error("El medico no tiene una direccion presencial configurada");
    }
    return direccion;
  }

  private videoRoomId() {
    return `video-room_${randomUUID()}`;
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

  private changeState(
    userId: string,
    appointmentId: string,
    expectedStates: EstadoCita[],
    state: EstadoCita,
    action: string,
  ) {
    return this.db.$transaction(async (transaction) => {
      const appointments = new AppointmentsRepository(transaction);
      const changed = await appointments.updateStateIfCurrent(appointmentId, expectedStates, state);
      if (!changed) throw new Error("La cita fue modificada por otra solicitud");
      const appointment = await appointments.findById(appointmentId);
      if (!appointment) throw new Error("Cita no encontrada");
      const causeByState = {
        RECHAZADA: "CITA_RECHAZADA",
        CANCELADA: "CITA_CANCELADA",
      } as const;
      const cause = causeByState[state as keyof typeof causeByState];
      if (cause) {
        await this.invalidateVirtualAccess(transaction, appointment, cause);
      }
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

  private async invalidateVirtualAccess(
    transaction: Prisma.TransactionClient,
    appointment: { id: string; modalidad: ModalidadAtencion },
    cause: "CITA_RECHAZADA" | "CITA_CANCELADA" | "CITA_REPROGRAMADA" | "CITA_COMPLETADA",
  ) {
    if (appointment.modalidad !== ModalidadAtencion.VIRTUAL) return;

    const now = new Date();
    const appointments = new AppointmentsRepository(transaction);
    await appointments.markVideoRevoked(appointment.id, now);
    await new VideoRevocationRepository(transaction).enqueue(appointment.id, cause, now);
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
