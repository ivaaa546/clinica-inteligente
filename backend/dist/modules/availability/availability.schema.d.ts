import { z } from "zod";
export declare const availabilitySchema: z.ZodObject<{
    inicio: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    inicio: Date;
}, {
    inicio: Date;
}>;
