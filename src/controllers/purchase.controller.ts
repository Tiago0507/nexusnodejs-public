import type { Request, Response } from "express";
import { BadRequest, Forbidden, NotFound } from "../utils/errors.js";
import {
  createPurchase,
  getUserPurchases,
  getAllPurchases,
  getPurchaseById,
  getPurchasesByUser,
  updatePurchaseById,
  softDeletePurchaseById,
} from "../services/purchase.service.js";

export const postPurchase = async (req: Request, res: Response) => {
  const authUserId = req.user?.id as string | undefined;
  if (!authUserId) throw BadRequest("Usuario no autenticado");

  const { eventId, typeId, quantity } = req.body as {
    eventId?: string;
    typeId?: string;
    quantity?: number;
  };

  if (!eventId || !typeId || typeof quantity !== "number") {
    throw BadRequest("Faltan campos: eventId, typeId, quantity");
  }

  const result = await createPurchase(authUserId, { eventId, typeId, quantity });
  res.status(201).json(result);
};

// GET /api/purchases/mine
export const getMyPurchases = async (req: Request, res: Response) => {
  const authUserId = req.user?.id as string | undefined;
  if (!authUserId) throw BadRequest("Usuario no autenticado");
  const data = await getUserPurchases(authUserId);
  res.json(data);
};

// GET /api/purchases  (solo superadmin; la ruta ya está protegida por rbac, pero validamos igual)
export const getAll = async (req: Request, res: Response) => {
  const role = String(req.user?.role ?? "user");
  if (role !== "superadmin") throw Forbidden("No autorizado");
  const data = await getAllPurchases();
  res.json(data);
};

// GET /api/purchases/:id  (dueño o superadmin)
export const getOne = async (req: Request, res: Response) => {
  const { id } = req.params as { id?: string };
  if (!id) throw BadRequest("id es requerido");

  const item = await getPurchaseById(id);
  if (!item) throw NotFound("Purchase no encontrada");

  const authUserId = String(req.user?.id ?? "");
  const role = String(req.user?.role ?? "user");
  const isOwner = item.userId?.toString?.() === authUserId;

  if (!isOwner && role !== "superadmin") throw Forbidden("No autorizado");
  res.json(item);
};

// GET /api/purchases/user/:userId  (ese usuario o superadmin)
export const getByUser = async (req: Request, res: Response) => {
  const { userId: targetUserId } = req.params as { userId?: string };
  if (!targetUserId) throw BadRequest("userId es requerido");

  const role = String(req.user?.role ?? "user");
  const authUserId = String(req.user?.id ?? "");
  const isSelf = targetUserId === authUserId;

  if (!isSelf && role !== "superadmin") throw Forbidden("No autorizado");
  const data = await getPurchasesByUser(targetUserId);
  res.json(data);
};

// PUT /api/purchases/:id  (superadmin)
export const putPurchase = async (req: Request, res: Response) => {
  const { id } = req.params as { id?: string };
  if (!id) throw BadRequest("id es requerido");
  const updated = await updatePurchaseById(id, req.body);
  res.json(updated);
};

// DELETE /api/purchases/:id  (superadmin)
export const deletePurchase = async (req: Request, res: Response) => {
  const { id } = req.params as { id?: string };
  if (!id) throw BadRequest("id es requerido");
  const result = await softDeletePurchaseById(id);
  res.json(result);
};
