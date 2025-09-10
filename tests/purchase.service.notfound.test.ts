import { describe, it, expect, vi } from "vitest";

// Mongoose: default + Types.ObjectId + startSession.withTransaction
vi.mock("mongoose", () => {
    const session = {
        withTransaction: async (fn: any) => { await fn(); },
        endSession: () => { },
    };
    const mongooseMock = {
        startSession: vi.fn().mockResolvedValue(session),
        Types: {
            ObjectId: vi.fn((v?: string) => ({ toString: () => String(v ?? "id") })),
        },
    };
    return { default: mongooseMock, ...mongooseMock };
});

// Repos: éxito en todo menos findByIdPopulated (que devolverá null)
vi.mock("../src/repositories/event.repo.ts", () => ({
    findTicketTypeOrThrow: vi.fn().mockResolvedValue({ price: 10, category: "G", quantityAvailable: 10 }),
    decrementStock: vi.fn(),
}));
vi.mock("../src/repositories/purchase.repo.ts", () => ({
    createPurchaseDoc: vi.fn().mockResolvedValue({ _id: "p1" }),
    attachTickets: vi.fn(),
    findByIdPopulated: vi.fn().mockResolvedValue(null), // <- fuerza el NotFound
}));
vi.mock("../src/repositories/ticket.repo.ts", () => ({
    insertManyTickets: vi.fn().mockResolvedValue([{ _id: "t1" }]),
}));

import { createPurchase } from "../src/services/purchase.service";

describe("purchase.service notfound", () => {
    it("lanza si findByIdPopulated devuelve null", async () => {
        await expect(createPurchase("u1", { eventId: "e1", typeId: "tt1", quantity: 1 }))
            .rejects.toThrow(/no encontrada/i);
    });
});
