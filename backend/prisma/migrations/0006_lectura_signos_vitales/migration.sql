-- Lecturas de frecuencia cardíaca enviadas por dispositivos (ESP32); una por cita.
CREATE TABLE "lectura_signos_vitales" (
    "id" UUID NOT NULL,
    "cita_id" UUID NOT NULL,
    "frec_cardiaca" INTEGER,
    "dispositivo_id" VARCHAR(100),
    "medido_en" TIMESTAMPTZ(6),
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "lectura_signos_vitales_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "lectura_signos_vitales_cita_id_key" ON "lectura_signos_vitales"("cita_id");

ALTER TABLE "lectura_signos_vitales"
    ADD CONSTRAINT "lectura_signos_vitales_cita_id_fkey"
    FOREIGN KEY ("cita_id") REFERENCES "cita"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
