import { Prisma, PrismaClient } from "@prisma/client";
export type PreconsultationInput = {
    motivoConsulta: string;
    antecedentesIniciales?: Prisma.InputJsonValue;
};
export declare class PreconsultationsService {
    private readonly db;
    constructor(db: PrismaClient);
    create(patientUserId: string, citaId: string, input: PreconsultationInput): Promise<{
        id: string;
        creadoEn: Date;
        actualizadoEn: Date;
        citaId: string;
        motivoConsulta: string;
        antecedentesIniciales: Prisma.JsonValue | null;
    }>;
    update(patientUserId: string, id: string, input: PreconsultationInput): Promise<{
        id: string;
        creadoEn: Date;
        actualizadoEn: Date;
        citaId: string;
        motivoConsulta: string;
        antecedentesIniciales: Prisma.JsonValue | null;
    }>;
    getForDoctor(doctorUserId: string, citaId: string): Promise<{
        id: string;
        creadoEn: Date;
        actualizadoEn: Date;
        citaId: string;
        motivoConsulta: string;
        antecedentesIniciales: Prisma.JsonValue | null;
    } | null>;
    private authorizePatientAppointment;
    private assertNotCompleted;
}
