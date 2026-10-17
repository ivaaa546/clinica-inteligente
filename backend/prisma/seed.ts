import argon2 from "argon2";
import { PrismaClient, RolUsuario, SexoPaciente } from "@prisma/client";

const prisma = new PrismaClient();

const requiredEnv = (name: string) => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`La variable ${name} es obligatoria para ejecutar el seed`);
  }

  return value;
};

const hashPassword = (password: string) =>
  argon2.hash(password, {
    type: argon2.argon2id,
    timeCost: Number(process.env.ARGON2_TIME_COST ?? 3),
    memoryCost: Number(process.env.ARGON2_MEMORY_COST ?? 65536),
    parallelism: Number(process.env.ARGON2_PARALLELISM ?? 1),
  });

async function main() {
  const adminEmail = requiredEnv("SEED_ADMIN_EMAIL");
  const adminPassword = requiredEnv("SEED_ADMIN_PASSWORD");
  const doctorEmail = requiredEnv("SEED_DOCTOR_EMAIL");
  const doctorPassword = requiredEnv("SEED_DOCTOR_PASSWORD");
  const professionalNumber = requiredEnv("SEED_DOCTOR_PROFESSIONAL_NUMBER");
  const specialtyName = process.env.SEED_SPECIALTY_NAME ?? "Medicina General";

  const specialty = await prisma.especialidad.upsert({
    where: { nombre: specialtyName },
    update: { activa: true },
    create: { nombre: specialtyName, activa: true },
  });

  // Upsert permite ejecutar el seed varias veces sin duplicar cuentas ni especialidades.
  await prisma.usuario.upsert({
    where: { correo: adminEmail },
    update: {
      nombre: "Administrador",
      apellidos: "De Desarrollo",
      contrasenaHash: await hashPassword(adminPassword),
      telefono: "00000000",
      rol: RolUsuario.ADMINISTRADOR,
      activo: true,
    },
    create: {
      nombre: "Administrador",
      apellidos: "De Desarrollo",
      correo: adminEmail,
      contrasenaHash: await hashPassword(adminPassword),
      telefono: "00000000",
      rol: RolUsuario.ADMINISTRADOR,
    },
  });

  const doctorUser = await prisma.usuario.upsert({
    where: { correo: doctorEmail },
    update: {
      nombre: "Medico",
      apellidos: "De Desarrollo",
      contrasenaHash: await hashPassword(doctorPassword),
      telefono: "00000001",
      rol: RolUsuario.MEDICO,
      activo: true,
    },
    create: {
      nombre: "Medico",
      apellidos: "De Desarrollo",
      correo: doctorEmail,
      contrasenaHash: await hashPassword(doctorPassword),
      telefono: "00000001",
      rol: RolUsuario.MEDICO,
    },
  });

  await prisma.medico.upsert({
    where: { usuarioId: doctorUser.id },
    update: { especialidadId: specialty.id, numeroProfesional: professionalNumber },
    create: {
      usuarioId: doctorUser.id,
      especialidadId: specialty.id,
      numeroProfesional: professionalNumber,
    },
  });

  console.log("Seed completado correctamente");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
