import { Router } from "express";
import {
  postPurchase,
  getMyPurchases,
  getAll,
  getOne,
  getByUser,
  putPurchase,
  deletePurchase,
} from "../controllers/purchase.controller.js";
import { auth } from "../middlewares/auth.js";
import { rbac } from "../middlewares/rbac.js";
import { validate } from "../middlewares/validate.js";
import { CreatePurchaseDTO } from "../validators/purchase.validators.js";

const r = Router();

// Crear compra (estado 'created' para esta entrega)
r.post("/", auth, validate(CreatePurchaseDTO), postPurchase);

// Mis compras
r.get("/mine", auth, getMyPurchases);

// Listado global (solo superadmin)
r.get("/", auth, rbac(["superadmin"]), getAll);

// Historial por usuario (self o superadmin)
r.get("/user/:userId", auth, getByUser);

// Obtener una compra por id (dueño o superadmin)
r.get("/:id", auth, getOne);

// Actualizar compra (solo superadmin, p. ej. cambiar 'status')
r.put("/:id", auth, rbac(["superadmin"]), putPurchase);

// Borrado lógico (solo superadmin)
r.delete("/:id", auth, rbac(["superadmin"]), deletePurchase);

export default r;
