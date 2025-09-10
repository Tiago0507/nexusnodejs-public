import { describe, it, expect } from "vitest";
import jwt from "jsonwebtoken";
import { auth } from "../src/middlewares/auth";

// helper para correr el middleware
const run = (mw: any, req: any) =>
    new Promise((resolve, reject) => mw(req, {} as any, (e?: any) => (e ? reject(e) : resolve(null))));

describe("middlewares/auth more", () => {
    it("falla con token Bearer mal firmado (Invalid token)", async () => {
        const badToken = jwt.sign({ sub: "u1", role: "user" }, "otro-secret"); // firma distinta
        const req: any = { header: () => `Bearer ${badToken}` };
        await expect(run(auth, req)).rejects.toThrow(/invalid token/i);
    });
});
