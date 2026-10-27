-- Estados explícitos para diferenciar mediciones, autorreportes y ausencia de dato.
CREATE TYPE "EstadoSignoVital" AS ENUM ('MEDIDO', 'AUTORREPORTADO', 'NO_MEDIDO');

ALTER TABLE "signos_vitales"
    ALTER COLUMN "peso_lb" DROP NOT NULL,
    ALTER COLUMN "talla_cm" DROP NOT NULL,
    ALTER COLUMN "temperatura" DROP NOT NULL,
    ALTER COLUMN "presion_arterial" DROP NOT NULL,
    ALTER COLUMN "frec_cardiaca" DROP NOT NULL,
    ALTER COLUMN "frec_respiratoria" DROP NOT NULL,
    ADD COLUMN "peso_lb_estado" "EstadoSignoVital" NOT NULL DEFAULT 'MEDIDO',
    ADD COLUMN "talla_cm_estado" "EstadoSignoVital" NOT NULL DEFAULT 'MEDIDO',
    ADD COLUMN "temperatura_estado" "EstadoSignoVital" NOT NULL DEFAULT 'MEDIDO',
    ADD COLUMN "presion_arterial_estado" "EstadoSignoVital" NOT NULL DEFAULT 'MEDIDO',
    ADD COLUMN "frec_cardiaca_estado" "EstadoSignoVital" NOT NULL DEFAULT 'MEDIDO',
    ADD COLUMN "frec_respiratoria_estado" "EstadoSignoVital" NOT NULL DEFAULT 'MEDIDO';

-- Las filas existentes proceden del flujo anterior, donde todos los signos eran obligatorios.
ALTER TABLE "signos_vitales"
    ALTER COLUMN "peso_lb_estado" SET DEFAULT 'NO_MEDIDO',
    ALTER COLUMN "talla_cm_estado" SET DEFAULT 'NO_MEDIDO',
    ALTER COLUMN "temperatura_estado" SET DEFAULT 'NO_MEDIDO',
    ALTER COLUMN "presion_arterial_estado" SET DEFAULT 'NO_MEDIDO',
    ALTER COLUMN "frec_cardiaca_estado" SET DEFAULT 'NO_MEDIDO',
    ALTER COLUMN "frec_respiratoria_estado" SET DEFAULT 'NO_MEDIDO',
    ADD CONSTRAINT "signos_vitales_estados_y_valores_validos"
    CHECK (
        ("peso_lb_estado" = 'NO_MEDIDO') = ("peso_lb" IS NULL)
        AND ("talla_cm_estado" = 'NO_MEDIDO') = ("talla_cm" IS NULL)
        AND ("temperatura_estado" = 'NO_MEDIDO') = ("temperatura" IS NULL)
        AND ("presion_arterial_estado" = 'NO_MEDIDO') = ("presion_arterial" IS NULL)
        AND ("frec_cardiaca_estado" = 'NO_MEDIDO') = ("frec_cardiaca" IS NULL)
        AND ("frec_respiratoria_estado" = 'NO_MEDIDO') = ("frec_respiratoria" IS NULL)
    );

CREATE TYPE "CausaRevocacionVideo" AS ENUM (
    'CITA_RECHAZADA',
    'CITA_CANCELADA',
    'CITA_REPROGRAMADA',
    'CITA_COMPLETADA',
    'FIN_VENTANA'
);

CREATE TYPE "EstadoTareaRevocacionVideo" AS ENUM ('PENDIENTE', 'EN_PROCESO', 'COMPLETADA');

CREATE TABLE "tarea_revocacion_video" (
    "id" UUID NOT NULL,
    "cita_id" UUID NOT NULL,
    "causa" "CausaRevocacionVideo" NOT NULL,
    "estado" "EstadoTareaRevocacionVideo" NOT NULL DEFAULT 'PENDIENTE',
    "intentos" INTEGER NOT NULL DEFAULT 0,
    "proximo_intento_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completada_en" TIMESTAMPTZ(6),
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "tarea_revocacion_video_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "tarea_revocacion_video_estado_proximo_intento_en_idx"
    ON "tarea_revocacion_video"("estado", "proximo_intento_en");

CREATE INDEX "tarea_revocacion_video_cita_id_causa_estado_idx"
    ON "tarea_revocacion_video"("cita_id", "causa", "estado");

CREATE UNIQUE INDEX "tarea_revocacion_video_activa_por_cita_y_causa_key"
    ON "tarea_revocacion_video"("cita_id", "causa")
    WHERE "estado" IN ('PENDIENTE', 'EN_PROCESO');

ALTER TABLE "tarea_revocacion_video"
    ADD CONSTRAINT "tarea_revocacion_video_cita_id_fkey"
    FOREIGN KEY ("cita_id") REFERENCES "cita"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
