-- Signos opcionales informados por el paciente antes de la consulta.
ALTER TABLE "preconsulta"
    ADD COLUMN "signos_vitales" JSONB;
