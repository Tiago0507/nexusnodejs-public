import { describe, it, expect, vi, beforeEach } from "vitest";

// mock del service para controlar respuestas
vi.mock("../src/services/ticket.service.ts", () => ({
    listTickets: vi.fn().mockResolvedValue([{ dummy: true }]),
}));

import { getTickets } from "../src/controllers/ticket.controller";
import * as svc from "../src/services/ticket.service";

// response encadenable
function makeRes() {
    const r: any = {};
    r.status = vi.fn().mockImplementation(() => r);
    r.json = vi.fn().mockImplementation(() => r);
    return r;
}

describe("ticket.controller extra", () => {
    beforeEach(() => vi.clearAllMocks());

    it("getTickets sin eventId usa listTickets (ruta global)", async () => {
        const r = makeRes();
        await getTickets({ query: {} } as any, r);
        expect(svc.listTickets).toHaveBeenCalled();
        expect(r.json).toHaveBeenCalledWith([{ dummy: true }]);
    });
});
