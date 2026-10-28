import { Router } from "express";
import { adminRouter } from "../modules/admin/admin.routes.js";
import { appointmentsRouter } from "../modules/appointments/appointments.routes.js";
import { availabilityRouter } from "../modules/availability/availability.routes.js";
import { authRouter } from "../modules/auth/auth.routes.js";
import { consultationsRouter } from "../modules/consultations/consultations.routes.js";
import { doctorsRouter } from "../modules/doctors/doctors.routes.js";
import { patientsRouter } from "../modules/patients/patients.routes.js";
import { preconsultationsRouter } from "../modules/preconsultations/preconsultations.routes.js";
import { prescriptionsRouter } from "../modules/prescriptions/prescriptions.routes.js";
import { specialtiesRouter } from "../modules/specialties/specialties.routes.js";
import { usersRouter } from "../modules/users/users.routes.js";
import { videoCallsRouter } from "../modules/video-calls/video-calls.routes.js";

export const apiRouter = Router();

// Todos los endpoints funcionales comparten una version explicita de la API.
apiRouter.use("/auth", authRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/patients", patientsRouter);
apiRouter.use("/doctors", doctorsRouter);
apiRouter.use("/specialties", specialtiesRouter);
apiRouter.use("/availability", availabilityRouter);
apiRouter.use("/appointments", appointmentsRouter);
apiRouter.use("/preconsultations", preconsultationsRouter);
apiRouter.use("/consultations", consultationsRouter);
apiRouter.use("/prescriptions", prescriptionsRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/video-calls", videoCallsRouter);
