import { TipoFichaClinica } from "@prisma/client";
import { z } from "zod";

// Los signos vitales mínimos son obligatorios para cerrar una consulta.
const signs = z.object({ pesoLb: z.number(), tallaCm: z.number(), temperatura: z.number(), presionArterial: z.string().min(1), frecCardiaca: z.number(), frecRespiratoria: z.number() });
const evaluation = z.union([
  z.object({ tipoFicha: z.literal(TipoFichaClinica.ADULTO), evaluacionClinica: z.object({ problemas_activos: z.array(z.string()), signos_peligro: z.array(z.string()) }) }),
  z.object({ tipoFicha: z.literal(TipoFichaClinica.PRENATAL), evaluacionClinica: z.object({ semanas_gestacion: z.number(), posicion_fetal: z.string(), presentacion: z.string(), signos_peligro: z.array(z.string()) }) }),
  z.object({ tipoFicha: z.literal(TipoFichaClinica.NEONATO), evaluacionClinica: z.object({ peso_nacer_g: z.number(), apgar_1min: z.number(), apgar_5min: z.number(), edad_gestacional_semanas: z.number(), signos_peligro: z.array(z.string()) }) }),
]);

export const consultationSchema = z.object({
  citaId: z.string().uuid(),
  tipoFicha: z.nativeEnum(TipoFichaClinica),
  motivoConsulta: z.string().min(1),
  historiaActual: z.string().optional(),
  diagnostico: z.string().min(1),
  observaciones: z.string().optional(),
  signosVitales: signs,
  evaluacionClinica: z.any().optional(),
}).superRefine((value, context) => {
  if (value.evaluacionClinica !== undefined && !evaluation.safeParse({ tipoFicha: value.tipoFicha, evaluacionClinica: value.evaluacionClinica }).success) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: "Evaluacion clinica invalida para la ficha seleccionada", path: ["evaluacionClinica"] });
  }
});
