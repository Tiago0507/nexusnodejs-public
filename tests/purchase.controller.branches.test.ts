import { describe, it, expect, vi } from "vitest";
import { getOne, getByUser, getAll } from "../src/controllers/purchase.controller";
vi.mock("../src/services/purchase.service.ts", () => ({
    getPurchaseById: vi.fn().mockResolvedValue({ _id: "p1", userId: { toString: () => "owner" } }),
    getPurchasesByUser: vi.fn().mockResolvedValue([]),
    getAllPurchases: vi.fn().mockResolvedValue([]),
}));

const res = () => { const r: any = {}; r.status = vi.fn().mockReturnValue(r); r.json = vi.fn().mockReturnValue(r); return r; };

describe("purchase.controller branches", () => {
    it("getOne: Forbidden si no es dueño ni superadmin", async () => {
        await expect(getOne({ params: { id: "p1" }, user: { id: "intruder", role: "user" } } as any, res()))
            .rejects.toThrow(/no autorizado/i);
    });

    it("getByUser: Forbidden si consulta otro usuario y no es superadmin", async () => {
        await expect(getByUser({ params: { userId: "someone" }, user: { id: "me", role: "user" } } as any, res()))
            .rejects.toThrow(/no autorizado/i);
    });

    it("getAll: Forbidden si role != superadmin", async () => {
        await expect(getAll({ user: { role: "user" } } as any, res())).rejects.toThrow(/no autorizado/i);
    });
});
