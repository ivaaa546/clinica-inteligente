import type { RolUsuario } from "@prisma/client";
import type { RequestHandler } from "express";
export declare const requireRoles: (...allowedRoles: RolUsuario[]) => RequestHandler;
