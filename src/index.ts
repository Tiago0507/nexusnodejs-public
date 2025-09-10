import express from "express";
import morgan from "morgan";
import createHttpError from "http-errors";
import { connectDB } from "./db/index.js";
import { ENV } from "./config/env.js";

// Rutas
import purchaseRoutes from "./routes/purchase.routes.js";
import ticketRoutes from "./routes/ticket.routes.js";

const app = express();
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => res.json({ ok: true }));

// Montaje de módulos (CRUD visibles para la entrega)
app.use("/api/purchases", purchaseRoutes);
app.use("/api/tickets", ticketRoutes);

// 404
app.use((_req, _res, next) => next(createHttpError(404, "Not Found")));

// Error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = err?.status || 500;
  res.status(status).json({ error: { message: err?.message ?? "Internal Server Error", status } });
});

// Hardening de arranque
process.on("unhandledRejection", (reason) => {
  console.error("[unhandledRejection]", reason);
});
process.on("uncaughtException", (err) => {
  console.error("[uncaughtException]", err);
  process.exit(1);
});

(async () => {
  try {
    await connectDB(ENV.MONGODB_URI);
    app.listen(ENV.PORT, () => {
      console.log(`[server] http://localhost:${ENV.PORT}`);
    });
  } catch (err) {
    console.error("[boot error]", err);
    process.exit(1);
  }
})();
