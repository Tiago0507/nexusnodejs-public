import { describe, it, expect, vi } from "vitest";
import {
    postValidateTicket,
    getTicketsForEvent,
    postTicket,
    putTicket,
    deleteTicket,
} from "../src/controllers/ticket.controller";

// helper para simular Response encadenable
function makeRes() {
    const r: any = {};
    r.status = vi.fn().mockImplementation(() => r);
    r.json = vi.fn().mockImplementation(() => r);
    return r;
}

describe("ticket.controller negatives", () => {
    it("postValidateTicket: lanza si faltan campos", async () => {
        await expect(postValidateTicket({ body: {} } as any, makeRes())).rejects.toThrow(/eventId.*code/i);
    });

    it("getTicketsForEvent: lanza si falta eventId", async () => {
        await expect(getTicketsForEvent({ params: {} } as any, makeRes())).rejects.toThrow(/eventId/i);
    });

    it("postTicket: exige todos los campos", async () => {
        await expect(postTicket({ user: { id: "u1" }, body: { eventId: "e1" } } as any, makeRes()))
            .rejects.toThrow(/eventId, category, price, quantityAvailable/i);
    });

    it("putTicket: lanza si falta id", async () => {
        await expect(
            putTicket({ user: { id: "u1", role: "organizer" }, params: {}, body: {} } as any, makeRes())
        ).rejects.toThrow(/id es requerido/i);
    });

    it("putTicket: lanza si falta eventId con id presente", async () => {
        await expect(
            putTicket({ user: { id: "u1", role: "organizer" }, params: { id: "tt1" }, body: {} } as any, makeRes())
        ).rejects.toThrow(/eventId es requerido/i);
    });

    it("deleteTicket: exige id y eventId", async () => {
        await expect(
            deleteTicket({ user: { id: "u1" }, params: {}, query: {} } as any, makeRes())
        ).rejects.toThrow(/id|eventId/i);
    });
});
