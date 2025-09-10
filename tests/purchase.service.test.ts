import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock("mongoose", () => {
  const sessionMock = {
    withTransaction: async (fn: () => Promise<void>) => { await fn(); },
    endSession: vi.fn(),
  };

  const mongooseMock = {
    startSession: vi.fn().mockResolvedValue(sessionMock),
    Types: {
      ObjectId: vi.fn((v?: string) => ({ toString: () => String(v ?? "id") })),
    },
  };

  // Importante: devolver default + nombrados
  return {
    default: mongooseMock,
    ...mongooseMock,
  };
});

vi.mock('../src/repositories/event.repo.ts', () => ({
  findTicketTypeOrThrow: vi.fn(),
  decrementStock: vi.fn(),
}));
vi.mock('../src/repositories/purchase.repo.ts', () => ({
  createPurchaseDoc: vi.fn(),
  attachTickets: vi.fn(),
  findByIdPopulated: vi.fn(),
  listByUser: vi.fn(),
  listAll: vi.fn(),
  updateById: vi.fn(),
  softDeleteById: vi.fn(),
}));
vi.mock('../src/repositories/ticket.repo.ts', () => ({
  insertManyTickets: vi.fn(),
}));

import { createPurchase, getUserPurchases, getAllPurchases, updatePurchaseById, softDeletePurchaseById } from '../src/services/purchase.service.ts';
import * as eventRepo from '../src/repositories/event.repo.ts';
import * as purchaseRepo from '../src/repositories/purchase.repo.ts';
import * as ticketRepo from '../src/repositories/ticket.repo.ts';

describe('purchase.service', () => {
  beforeEach(() => vi.clearAllMocks());

  it('createPurchase: descuenta stock, crea compra y tickets, y devuelve compra poblada', async () => {
    (eventRepo.findTicketTypeOrThrow as any).mockResolvedValue({ price: 20, category: 'General', quantityAvailable: 50 });
    (purchaseRepo.createPurchaseDoc as any).mockResolvedValue({ _id: 'p1' });
    (ticketRepo.insertManyTickets as any).mockResolvedValue([{ _id: 't1' }, { _id: 't2' }]);
    (purchaseRepo.attachTickets as any).mockResolvedValue(undefined);
    (purchaseRepo.findByIdPopulated as any).mockResolvedValue({ _id: 'p1', ticketIds: ['t1', 't2'] });

    const out = await createPurchase('u1', { eventId: 'e1', typeId: 'tt1', quantity: 2 });
    expect(eventRepo.findTicketTypeOrThrow).toHaveBeenCalled();
    expect(eventRepo.decrementStock).toHaveBeenCalledWith('e1', 'tt1', 2, expect.anything());
    expect(ticketRepo.insertManyTickets).toHaveBeenCalled();
    expect(out._id).toBe('p1');
    expect(out.ticketIds).toHaveLength(2);
  });

  it('createPurchase: falla si no hay stock suficiente', async () => {
    (eventRepo.findTicketTypeOrThrow as any).mockResolvedValue({ price: 20, category: 'General', quantityAvailable: 1 });
    await expect(createPurchase('u1', { eventId: 'e1', typeId: 'tt1', quantity: 2 })).rejects.toThrow(/stock/i);
  });

  it('getUserPurchases: lista por usuario', async () => {
    (purchaseRepo.listByUser as any).mockResolvedValue([{ _id: 'p1' }]);
    const r = await getUserPurchases('u1');
    expect(r).toHaveLength(1);
  });

  it('getAllPurchases/update/delete: basicos', async () => {
    (purchaseRepo.listAll as any).mockResolvedValue([{ _id: 'p1' }]);
    (purchaseRepo.updateById as any).mockResolvedValue({ _id: 'p1', status: 'created' });
    (purchaseRepo.softDeleteById as any).mockResolvedValue(true);

    expect((await getAllPurchases()).length).toBe(1);
    expect((await updatePurchaseById('p1', { status: 'created' })).status).toBe('created');
    expect(await softDeletePurchaseById('p1')).toEqual({ ok: true, id: 'p1' });
  });
});
