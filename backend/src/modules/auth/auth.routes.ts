import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { changePassword, login, logout, me, register } from "./auth.controller.js";

export const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", requireAuth(prisma), logout);
authRouter.get("/me", requireAuth(prisma), me);
authRouter.patch("/password", requireAuth(prisma), changePassword);
