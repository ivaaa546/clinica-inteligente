import { Prisma, PrismaClient } from "@prisma/client";
type DbClient = PrismaClient | Prisma.TransactionClient;
export declare class MetricsRepository {
    private readonly db;
    constructor(db: DbClient);
    countActivePatients(): Prisma.PrismaPromise<number>;
    countActiveDoctors(): Prisma.PrismaPromise<number>;
    countActiveUsersByRole(): Prisma.GetUsuarioGroupByPayload<{
        by: "rol"[];
        where: {
            activo: true;
        };
        _count: {
            _all: true;
        };
    }>;
    countAppointmentsByState(): Prisma.GetCitaGroupByPayload<{
        by: "estado"[];
        _count: {
            _all: true;
        };
    }>;
    countCompletedConsultations(): Prisma.PrismaPromise<number>;
}
export {};
