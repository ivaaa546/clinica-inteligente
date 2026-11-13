import { describe, expect, it } from "vitest";
import { preconsultationSchema } from "../src/modules/preconsultations/preconsultations.schema.js";

const base = {
  citaId: "00000000-0000-4000-8000-000000000001",
  motivoConsulta: "Control general",
};

describe("contrato de preconsulta del paciente", () => {
  it("acepta únicamente la talla como medición autorreportada", () => {
    expect(preconsultationSchema.safeParse({ ...base, signosVitales: { tallaCm: 169 } }).success).toBe(true);
  });

  it("rechaza signos bloqueados y una frecuencia cardíaca escrita manualmente", () => {
    expect(preconsultationSchema.safeParse({ ...base, signosVitales: { pesoLb: 140 } }).success).toBe(false);
    expect(preconsultationSchema.safeParse({ ...base, signosVitales: { frecCardiaca: 72 } }).success).toBe(false);
  });
});
