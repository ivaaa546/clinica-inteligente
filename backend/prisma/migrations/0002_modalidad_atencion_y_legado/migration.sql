-- Modalidades habilitadas por bloque y seleccionadas por cada cita.
CREATE TYPE "ModalidadAtencion" AS ENUM ('PRESENCIAL', 'VIRTUAL');

ALTER TABLE "medico"
    ADD COLUMN "direccion_atencion_presencial" VARCHAR(255);

ALTER TABLE "disponibilidad"
    ADD COLUMN "modalidades" "ModalidadAtencion"[] NOT NULL
        DEFAULT ARRAY['PRESENCIAL']::"ModalidadAtencion"[];

ALTER TABLE "cita"
    ADD COLUMN "modalidad" "ModalidadAtencion" NOT NULL DEFAULT 'PRESENCIAL',
    ADD COLUMN "direccion_atencion_presencial" VARCHAR(255),
    ADD COLUMN "direccion_presencial_es_legado" BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN "sala_video_id" VARCHAR(100),
    ADD COLUMN "video_revocada_en" TIMESTAMPTZ(6);

-- El esquema previo no registraba la direccion de atencion. Se conserva su ausencia
-- como legado verificable, sin copiar la direccion actual del medico ni inventar datos.
UPDATE "cita"
SET "direccion_presencial_es_legado" = true
WHERE "modalidad" = 'PRESENCIAL'
  AND "direccion_atencion_presencial" IS NULL;

ALTER TABLE "disponibilidad"
    ADD CONSTRAINT "disponibilidad_modalidades_no_vacias"
    CHECK (cardinality("modalidades") > 0);

ALTER TABLE "cita"
    ADD CONSTRAINT "cita_modalidad_datos_validos"
    CHECK (
        (
            "modalidad" = 'PRESENCIAL'
            AND "sala_video_id" IS NULL
            AND (
                (
                    "direccion_presencial_es_legado" = true
                    AND "direccion_atencion_presencial" IS NULL
                )
                OR (
                    "direccion_presencial_es_legado" = false
                    AND NULLIF(BTRIM("direccion_atencion_presencial"), '') IS NOT NULL
                )
            )
        )
        OR (
            "modalidad" = 'VIRTUAL'
            AND "direccion_presencial_es_legado" = false
            AND "direccion_atencion_presencial" IS NULL
            AND "sala_video_id" IS NOT NULL
        )
    );

CREATE UNIQUE INDEX "cita_sala_video_id_key"
    ON "cita"("sala_video_id");
