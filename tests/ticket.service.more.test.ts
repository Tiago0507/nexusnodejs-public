import { describe, it, expect } from "vitest";

// Import directo del service
import {
    getTicketById,
    listTickets,
    deleteTicketCategory,
} from "../src/services/ticket.service";

// 1) getTicketById: en tu implementación actual lanza NotFound siempre
describe("ticket.service more", () => {
    it("getTicketById lanza NotFound (categoría embebida requiere eventId)", async () => {
        await expect(getTicketById("tt1")).rejects.toThrow(/usa .*event/i);
    });

    // 2) listTickets: ruta por defecto sin eventId
    it("listTickets retorna arreglo vacío (ruta global no usada en demo)", async () => {
        const r = await listTickets();
        expect(Array.isArray(r)).toBe(true);
        expect(r.length).toBe(0);
    });

    // 3) deleteTicketCategory: rol insuficiente
    it("deleteTicketCategory lanza Forbidden con rol user", async () => {
        await expect(
            // en tu service actual, si no pasas eventId, lanzará BadRequest. Primero probamos Forbidden por rol.
            deleteTicketCategory("tt1", { userId: "u1", role: "user" } as any)
        ).rejects.toThrow(/organizer|superadmin/i);
    });

    // 4) deleteTicketCategory: falta eventId (tu service exige eventId en este camino)
    it("deleteTicketCategory lanza BadRequest si falta eventId", async () => {
        await expect(
            // rol válido para pasar el guard de permisos y caer en la validación de eventId
            // @ts-expect-error: forzamos la firma sin eventId
            deleteTicketCategory("tt1", { userId: "u1", role: "organizer" })
        ).rejects.toThrow(/eventId/i); // menos estricto: cualquier mensaje que mencione eventId
    });

});
