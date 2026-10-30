import { RolUsuario } from "@prisma/client";
import type { RequestHandler } from "express";
import { z } from "zod";
import { SpecialtiesService } from "./specialties.service.js";

const specialtySchema = z.object({ nombre: z.string().min(1) });

export const listSpecialties: RequestHandler = async (request, response, next) => {
  try {
    const service = new SpecialtiesService(request.app.locals.prisma);
    const isAdmin = request.auth?.role === RolUsuario.ADMINISTRADOR;
    if (isAdmin) {
      response.json(await service.listAdmin());
    } else {
      response.json(await service.listPublic());
    }
  } catch (error) {
    next(error);
  }
};

export const createSpecialty: RequestHandler = async (request, response, next) => {
  try {
    response.status(201).json(await new SpecialtiesService(request.app.locals.prisma).create(request.auth!.userId, specialtySchema.parse(request.body).nombre));
  } catch (error) {
    next(error);
  }
};

export const updateSpecialty: RequestHandler = async (request, response, next) => {
  try {
    response.json(await new SpecialtiesService(request.app.locals.prisma).updateName(request.auth!.userId, String(request.params.id), specialtySchema.parse(request.body).nombre));
  } catch (error) {
    next(error);
  }
};

export const deactivateSpecialty: RequestHandler = async (request, response, next) => {
  try {
    response.json(await new SpecialtiesService(request.app.locals.prisma).deactivate(request.auth!.userId, String(request.params.id)));
  } catch (error) {
    next(error);
  }
};

export const activateSpecialty: RequestHandler = async (request, response, next) => {
  try {
    response.json(await new SpecialtiesService(request.app.locals.prisma).activate(request.auth!.userId, String(request.params.id)));
  } catch (error) {
    next(error);
  }
};

export const deleteSpecialty: RequestHandler = async (request, response, next) => {
  try {
    response.json(await new SpecialtiesService(request.app.locals.prisma).delete(request.auth!.userId, String(request.params.id)));
  } catch (error) {
    next(error);
  }
};
