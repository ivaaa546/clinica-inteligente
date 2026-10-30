import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { VideoCallsService } from "./video-calls.service.js";

export const videoCallsRouter = Router();
videoCallsRouter.post("/appointments/:id/access", requireAuth(prisma), async (request, response, next) => {
  try {
    const access = await new VideoCallsService(request.app.locals.prisma).issueAccess(request.auth!, String(request.params.id));
    response.json({ url: access.url, token: access.token, expiresAt: access.expiresAt });
  } catch (error) { next(error); }
});
