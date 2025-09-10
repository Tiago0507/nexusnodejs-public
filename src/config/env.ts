import dotenv from "dotenv";
dotenv.config();

function requireEnv(name: string): string {
    const v = process.env[name];
    if (!v) throw new Error(`Missing required env: ${name}`);
    return v;
}

export const ENV = {
    NODE_ENV: process.env.NODE_ENV ?? "development",
    PORT: Number(process.env.PORT ?? 3000),
    MONGODB_URI: requireEnv("MONGODB_URI"),
    JWT_SECRET: requireEnv("JWT_SECRET"), // no valores por defecto inseguros
};

// Roles del sistema para esta entrega
export type AppRole = "user" | "organizer" | "checker" | "admin" | "superadmin";

// Alias útil: si alguien aún emite "admin", trátalo como "superadmin" (taller pide superadmin)
const ROLE_ALIASES: Record<string, AppRole> = { admin: "superadmin" };

export function normalizeRole(role?: string): AppRole {
    const base = (role ?? "user").toLowerCase();
    return (ROLE_ALIASES[base] ?? (base as AppRole)) || "user";
}
