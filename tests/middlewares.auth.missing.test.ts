import { describe, it, expect } from "vitest";
import { auth } from "../src/middlewares/auth";

const run = (mw: any, req: any) => new Promise((res, rej) => mw(req, {} as any, (e?: any) => e ? rej(e) : res(null)));

describe("auth missing token", () => {
    it("lanza Missing token si no hay Authorization", async () => {
        await expect(run(auth, { header: () => undefined } as any)).rejects.toThrow(/missing token/i);
    });
});
