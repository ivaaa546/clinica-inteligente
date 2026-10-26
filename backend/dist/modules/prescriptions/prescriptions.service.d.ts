import { PrismaClient } from "@prisma/client";
export type PrescriptionInput = {
    consultaId: string;
    medicamento: string;
    dosis: string;
    via: string;
    frecuencia: string;
    duracion: string;
    indicaciones: string;
};
export declare class PrescriptionsService {
    private readonly db;
    constructor(db: PrismaClient);
    create(doctorUserId: string, input: PrescriptionInput): Promise<{
        id: string;
        creadoEn: Date;
        actualizadoEn: Date;
        consultaId: string;
        medicamento: string;
        dosis: string;
        via: string;
        frecuencia: string;
        duracion: string;
        indicaciones: string;
    }>;
    listForDoctor(doctorUserId: string, consultaId: string): Promise<{
        id: string;
        creadoEn: Date;
        actualizadoEn: Date;
        consultaId: string;
        medicamento: string;
        dosis: string;
        via: string;
        frecuencia: string;
        duracion: string;
        indicaciones: string;
    }[]>;
    listForPatient(patientUserId: string): Promise<{
        consulta: {
            diagnostico: string;
        };
        id: string;
        medicamento: string;
        dosis: string;
        via: string;
        frecuencia: string;
        duracion: string;
        indicaciones: string;
    }[]>;
}
