-- La validación en aplicación no es suficiente ante inserciones concurrentes.
-- btree_gist permite combinar igualdad de UUID con solapamiento de rangos temporales.
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "disponibilidad"
    ADD CONSTRAINT "disponibilidad_medico_sin_solapamientos"
    EXCLUDE USING gist (
        "medico_id" WITH =,
        tstzrange("inicio", "fin", '[)') WITH &&
    )
    WHERE ("activa");
