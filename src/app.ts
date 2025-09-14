import express from "express";
import type { Request, Response } from "express";
import dotenv from "dotenv";
import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/user/user.routes.js";
import roleRoutes from "./modules/user/role.routes.js";

dotenv.config();

const app = express();

app.use(express.json());

app.use("/api/v1/auth", authRoutes);

app.use("/api/v1/users", userRoutes);

app.use("/api/v1/roles", roleRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("API de TicketHub funcionando!");
});

export default app;
