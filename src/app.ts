import express from "express";
import type { Request, Response } from "express";
import dotenv from "dotenv";
import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/user/user.routes";
import roleRoutes from "./modules/user/role.routes";
import eventRoutes from './modules/event/event.routes';

dotenv.config();

const app = express();

app.use(express.json());

app.use("/api/v1/auth", authRoutes);

app.use("/api/v1/users", userRoutes);

app.use("/api/v1/roles", roleRoutes);

app.use("/api/v1/events", eventRoutes);

app.use("/api/v1", ticketRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("API de TicketHub funcionando!");
});

const API_BASE_URL = '/api/v1';
app.use(`${API_BASE_URL}/events`, eventRoutes);

export default app;
