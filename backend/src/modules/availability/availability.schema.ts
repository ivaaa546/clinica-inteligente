import { z } from "zod";

export const availabilitySchema = z.object({ inicio: z.coerce.date() });
