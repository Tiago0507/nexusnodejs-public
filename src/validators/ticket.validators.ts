import { z } from "zod";

export const ValidateTicketDTO = z.object({
  eventId: z.string().min(1, "eventId requerido"),
  code: z.string().min(6, "code inválido")
});
