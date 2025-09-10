import { z } from "zod";

export const CreatePurchaseDTO = z.object({
  eventId: z.string().min(1, "eventId requerido"),
  typeId: z.string().min(1, "typeId requerido"),
  quantity: z.number().int().positive("quantity > 0").max(10, "máximo 10 por compra")
});

export type TCreatePurchaseDTO = z.infer<typeof CreatePurchaseDTO>;
