import type { PrismaClient } from "@prisma/client";
import type { RequestHandler } from "express";
export declare const requireAuth: (db: PrismaClient) => RequestHandler;
