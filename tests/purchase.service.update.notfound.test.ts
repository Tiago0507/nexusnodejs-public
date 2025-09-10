import { describe, it, expect, vi } from "vitest";
vi.mock("../src/repositories/purchase.repo.ts", () => ({ updateById: vi.fn().mockResolvedValue(null) }));
import { updatePurchaseById } from "../src/services/purchase.service";

describe("purchase.service update NotFound", () => {
    it("lanza si updateById devuelve null", async () => {
        await expect(updatePurchaseById("p404", { status: "created" })).rejects.toThrow(/no encontrada/i);
    });
});
