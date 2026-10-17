-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('PACIENTE', 'MEDICO', 'ADMINISTRADOR');

-- CreateEnum
CREATE TYPE "SexoPaciente" AS ENUM ('M', 'F', 'NO_ESPECIFICADO');

-- CreateEnum
CREATE TYPE "TipoFichaClinica" AS ENUM ('ADULTO', 'PRENATAL', 'NEONATO');

-- CreateEnum
CREATE TYPE "EstadoCita" AS ENUM ('PENDIENTE', 'ACEPTADA', 'RECHAZADA', 'CANCELADA', 'REPROGRAMADA', 'COMPLETADA');

-- CreateTable
CREATE TABLE "usuario" (
    "id" UUID NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "apellidos" VARCHAR(100) NOT NULL,
    "correo" VARCHAR(150) NOT NULL,
    "contrasena_hash" VARCHAR(255) NOT NULL,
    "telefono" VARCHAR(20) NOT NULL,
    "rol" "RolUsuario" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paciente" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "fecha_nacimiento" DATE NOT NULL,
    "sexo" "SexoPaciente" NOT NULL,
    "direccion" VARCHAR(255),
    "ocupacion" VARCHAR(150),
    "poblacion_migrante" BOOLEAN NOT NULL DEFAULT false,
    "nombre_responsable" VARCHAR(200),
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "paciente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "antecedentes_generales" (
    "id" UUID NOT NULL,
    "paciente_id" UUID NOT NULL,
    "medicos" JSONB,
    "quirurgicos" TEXT,
    "familiares" JSONB,
    "habitos" JSONB,
    "alergias" TEXT NOT NULL,
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "antecedentes_generales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "antecedentes_gineco_obstetricos" (
    "id" UUID NOT NULL,
    "paciente_id" UUID NOT NULL,
    "fur" DATE,
    "gestas" INTEGER NOT NULL DEFAULT 0,
    "partos" INTEGER NOT NULL DEFAULT 0,
    "cesareas" INTEGER NOT NULL DEFAULT 0,
    "abortos" INTEGER NOT NULL DEFAULT 0,
    "hijos_vivos" INTEGER NOT NULL DEFAULT 0,
    "planificacion" VARCHAR(150),
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "antecedentes_gineco_obstetricos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "especialidad" (
    "id" UUID NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "especialidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medico" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "especialidad_id" UUID NOT NULL,
    "numero_profesional" VARCHAR(50) NOT NULL,
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "medico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disponibilidad" (
    "id" UUID NOT NULL,
    "medico_id" UUID NOT NULL,
    "inicio" TIMESTAMPTZ(6) NOT NULL,
    "fin" TIMESTAMPTZ(6) NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "disponibilidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cita" (
    "id" UUID NOT NULL,
    "paciente_id" UUID NOT NULL,
    "medico_id" UUID NOT NULL,
    "disponibilidad_id" UUID NOT NULL,
    "inicio" TIMESTAMPTZ(6) NOT NULL,
    "fin" TIMESTAMPTZ(6) NOT NULL,
    "estado" "EstadoCita" NOT NULL,
    "cita_origen_id" UUID,
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "cita_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "preconsulta" (
    "id" UUID NOT NULL,
    "cita_id" UUID NOT NULL,
    "motivo_consulta" TEXT NOT NULL,
    "antecedentes_iniciales" JSONB,
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "preconsulta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consulta" (
    "id" UUID NOT NULL,
    "cita_id" UUID NOT NULL,
    "tipo_ficha" "TipoFichaClinica" NOT NULL,
    "motivo_consulta" TEXT NOT NULL,
    "historia_actual" TEXT,
    "evaluacion_clinica" JSONB,
    "diagnostico" TEXT NOT NULL,
    "observaciones" TEXT,
    "fecha_consulta" TIMESTAMPTZ(6) NOT NULL,
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "consulta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "signos_vitales" (
    "id" UUID NOT NULL,
    "consulta_id" UUID NOT NULL,
    "peso_lb" DECIMAL(5,2) NOT NULL,
    "talla_cm" DECIMAL(5,2) NOT NULL,
    "temperatura" DECIMAL(4,2) NOT NULL,
    "presion_arterial" VARCHAR(20) NOT NULL,
    "frec_cardiaca" INTEGER NOT NULL,
    "frec_respiratoria" INTEGER NOT NULL,
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "signos_vitales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receta" (
    "id" UUID NOT NULL,
    "consulta_id" UUID NOT NULL,
    "medicamento" VARCHAR(150) NOT NULL,
    "dosis" VARCHAR(100) NOT NULL,
    "via" VARCHAR(50) NOT NULL,
    "frecuencia" VARCHAR(100) NOT NULL,
    "duracion" VARCHAR(50) NOT NULL,
    "indicaciones" TEXT NOT NULL,
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "receta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auditoria" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "accion" VARCHAR(100) NOT NULL,
    "entidad" VARCHAR(50) NOT NULL,
    "entidad_id" UUID NOT NULL,
    "ocurrido_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "detalle" TEXT,

    CONSTRAINT "auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_correo_key" ON "usuario"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "paciente_usuario_id_key" ON "paciente"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "antecedentes_generales_paciente_id_key" ON "antecedentes_generales"("paciente_id");

-- CreateIndex
CREATE UNIQUE INDEX "antecedentes_gineco_obstetricos_paciente_id_key" ON "antecedentes_gineco_obstetricos"("paciente_id");

-- CreateIndex
CREATE UNIQUE INDEX "especialidad_nombre_key" ON "especialidad"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "medico_usuario_id_key" ON "medico"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "medico_numero_profesional_key" ON "medico"("numero_profesional");

-- CreateIndex
CREATE INDEX "medico_especialidad_id_idx" ON "medico"("especialidad_id");

-- CreateIndex
CREATE UNIQUE INDEX "disponibilidad_medico_id_inicio_key" ON "disponibilidad"("medico_id", "inicio");

-- CreateIndex
CREATE INDEX "cita_medico_id_inicio_estado_idx" ON "cita"("medico_id", "inicio", "estado");

-- CreateIndex
CREATE INDEX "cita_paciente_id_inicio_idx" ON "cita"("paciente_id", "inicio");

-- CreateIndex
CREATE UNIQUE INDEX "preconsulta_cita_id_key" ON "preconsulta"("cita_id");

-- CreateIndex
CREATE UNIQUE INDEX "consulta_cita_id_key" ON "consulta"("cita_id");

-- CreateIndex
CREATE UNIQUE INDEX "signos_vitales_consulta_id_key" ON "signos_vitales"("consulta_id");

-- CreateIndex
CREATE INDEX "receta_consulta_id_idx" ON "receta"("consulta_id");

-- CreateIndex
CREATE INDEX "auditoria_usuario_id_ocurrido_en_idx" ON "auditoria"("usuario_id", "ocurrido_en");

-- AddForeignKey
ALTER TABLE "paciente" ADD CONSTRAINT "paciente_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "antecedentes_generales" ADD CONSTRAINT "antecedentes_generales_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "paciente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "antecedentes_gineco_obstetricos" ADD CONSTRAINT "antecedentes_gineco_obstetricos_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "paciente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medico" ADD CONSTRAINT "medico_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medico" ADD CONSTRAINT "medico_especialidad_id_fkey" FOREIGN KEY ("especialidad_id") REFERENCES "especialidad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disponibilidad" ADD CONSTRAINT "disponibilidad_medico_id_fkey" FOREIGN KEY ("medico_id") REFERENCES "medico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cita" ADD CONSTRAINT "cita_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "paciente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cita" ADD CONSTRAINT "cita_medico_id_fkey" FOREIGN KEY ("medico_id") REFERENCES "medico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cita" ADD CONSTRAINT "cita_disponibilidad_id_fkey" FOREIGN KEY ("disponibilidad_id") REFERENCES "disponibilidad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cita" ADD CONSTRAINT "cita_cita_origen_id_fkey" FOREIGN KEY ("cita_origen_id") REFERENCES "cita"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preconsulta" ADD CONSTRAINT "preconsulta_cita_id_fkey" FOREIGN KEY ("cita_id") REFERENCES "cita"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consulta" ADD CONSTRAINT "consulta_cita_id_fkey" FOREIGN KEY ("cita_id") REFERENCES "cita"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signos_vitales" ADD CONSTRAINT "signos_vitales_consulta_id_fkey" FOREIGN KEY ("consulta_id") REFERENCES "consulta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receta" ADD CONSTRAINT "receta_consulta_id_fkey" FOREIGN KEY ("consulta_id") REFERENCES "consulta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditoria" ADD CONSTRAINT "auditoria_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Restricciones de agenda que Prisma no expresa directamente.
ALTER TABLE "disponibilidad"
    ADD CONSTRAINT "disponibilidad_duracion_30_minutos"
    CHECK ("fin" = "inicio" + INTERVAL '30 minutes');

ALTER TABLE "cita"
    ADD CONSTRAINT "cita_duracion_30_minutos"
    CHECK ("fin" = "inicio" + INTERVAL '30 minutes');

-- Solo puede existir una cita activa por bloque de disponibilidad.
CREATE UNIQUE INDEX "cita_disponibilidad_activa_key"
    ON "cita" ("disponibilidad_id")
    WHERE "estado" IN ('PENDIENTE', 'ACEPTADA');
