import crypto from "crypto";
export const sha256Hex = (s: string) => crypto.createHash("sha256").update(s).digest("hex");
