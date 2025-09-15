import { Router } from "express";
import controller from "./ticket.controller";

const router = Router();
const BASE = "/tickets";

// CRUD
router.post(`${BASE}`, controller.create);
router.get(`${BASE}`, controller.list);
router.get(`${BASE}/:id`, controller.getById);
router.put(`${BASE}/:id`, controller.update);
router.delete(`${BASE}/:id`, controller.remove);

// Extra
router.get(`${BASE}/validate/:ticketCode`, controller.validateByCode);
router.post(`${BASE}/use/:ticketCode`, controller.useByCode);

export default router;
