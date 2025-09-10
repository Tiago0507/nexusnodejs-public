import { describe, it, expect, vi } from "vitest";
vi.mock("../src/services/ticket.service.ts", () => ({ getTicketById: vi.fn().mockRejectedValue(new Error("Ticket no encontrado")) }));
import { getTicket } from "../src/controllers/ticket.controller";

const res = () => { const r: any = {}; r.status = vi.fn().mockReturnValue(r); r.json = vi.fn().mockReturnValue(r); return r; };

describe("ticket.controller get notfound", () => {
    it("propaga error si service falla", async () => {
        await expect(getTicket({ params: { id: "tt1" } } as any, res())).rejects.toThrow(/no encontrado/i);
    });
});
