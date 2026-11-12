import { describe, expect, it } from "vitest";
import { consultationSchema } from "../src/modules/consultations/consultations.schema.js";

const base = {
  citaId: "00000000-0000-4000-8000-000000000001",
  tipoFicha: "ADULTO",
  motivoConsulta: "Fiebre y control de presion",
  diagnostico: "Evaluacion en curso",
  recetas: [],
};

describe("contrato de signos vitales de consulta", () => {
  it("acepta valores variables y anormales dentro de limites tecnicos", () => {
    const result = consultationSchema.safeParse({
      ...base,
      signosVitales: {
        temperatura: { estado: "MEDIDO", valor: 40.2 },
        presionArterial: { estado: "MEDIDO", valor: "145/95" },
        frecCardiaca: { estado: "MEDIDO", valor: 130 },
      },
    });
    expect(result.success).toBe(true);
  });

  it("rechaza valores que no caben en almacenamiento o tienen formato invalido", () => {
    const result = consultationSchema.safeParse({
      ...base,
      signosVitales: {
        pesoLb: { estado: "MEDIDO", valor: 1000 },
        presionArterial: { estado: "MEDIDO", valor: "normal" },
      },
    });
    expect(result.success).toBe(false);
  });
});
