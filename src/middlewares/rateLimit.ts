import rateLimit from "express-rate-limit";

export default function rl(opts?: { windowMs?: number; max?: number }) {
    return rateLimit({
        windowMs: opts?.windowMs ?? 60_000,
        max: opts?.max ?? 60,
        standardHeaders: true,
        legacyHeaders: false,
        message: { error: { message: "Too many requests", status: 429 } }
    });
}
