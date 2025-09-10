import { describe, it, expect, vi, beforeEach } from 'vitest';
import { postPurchase, getMyPurchases, getAll, getOne, getByUser, putPurchase, deletePurchase } from '../src/controllers/purchase.controller.ts';

vi.mock('../src/services/purchase.service.ts', () => ({
  createPurchase: vi.fn(),
  getUserPurchases: vi.fn(),
  getAllPurchases: vi.fn(),
  getPurchaseById: vi.fn(),
  getPurchasesByUser: vi.fn(),
  updatePurchaseById: vi.fn(),
  softDeletePurchaseById: vi.fn(),
}));
import * as service from '../src/services/purchase.service.ts';

const res = () => {
  const r: any = {};
  r.status = vi.fn().mockReturnValue(r);
  r.json = vi.fn().mockReturnValue(r);
  return r;
};

describe('purchase.controller', () => {
  beforeEach(() => vi.clearAllMocks());

  it('postPurchase: crea compra', async () => {
    (service.createPurchase as any).mockResolvedValue({ _id: 'p1' });
    const req: any = { user: { id: 'u1' }, body: { eventId: 'e1', typeId: 'tt1', quantity: 2 } };
    const r = res();
    await postPurchase(req, r);
    expect(r.status).toHaveBeenCalledWith(201);
  });

  it('getAll: solo superadmin', async () => {
    const reqUser: any = { user: { id: 'u1', role: 'superadmin' } };
    const r = res();
    (service.getAllPurchases as any).mockResolvedValue([{ _id: 'p1' }]);
    await getAll(reqUser, r);
    expect(r.json).toHaveBeenCalled();
  });

  it('getOne: dueño puede ver; si no es dueño, requiere superadmin', async () => {
    (service.getPurchaseById as any).mockResolvedValue({ _id: 'p1', userId: { toString: () => 'u1' } });
    const r = res();
    await getOne({ params: { id: 'p1' }, user: { id: 'u1', role: 'user' } } as any, r);
    expect(r.json).toHaveBeenCalledWith({ _id: 'p1', userId: { toString: expect.any(Function) } });
  });

  it('getByUser: self ok, otros solo superadmin', async () => {
    (service.getPurchasesByUser as any).mockResolvedValue([{ _id: 'p1' }]);
    const r = res();
    await getByUser({ params: { userId: 'u1' }, user: { id: 'u1', role: 'user' } } as any, r);
    expect(r.json).toHaveBeenCalled();
  });

  it('put/delete: delegan al service', async () => {
    (service.updatePurchaseById as any).mockResolvedValue({ _id: 'p1', status: 'created' });
    (service.softDeletePurchaseById as any).mockResolvedValue({ ok: true, id: 'p1' });
    const r = res();
    await putPurchase({ params: { id: 'p1' }, body: { status: 'created' }, user: { role: 'superadmin' } } as any, r);
    await deletePurchase({ params: { id: 'p1' }, user: { role: 'superadmin' } } as any, r);
    expect(r.json).toHaveBeenCalledTimes(2);
  });
});
