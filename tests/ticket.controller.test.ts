import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTicketsForEvent, postValidateTicket, postTicket, putTicket, deleteTicket } from '../src/controllers/ticket.controller.ts';

vi.mock('../src/services/ticket.service.ts', () => ({
  validateTicket: vi.fn(),
  listTicketsByEvent: vi.fn(),
  createTicketCategory: vi.fn(),
  updateTicketCategory: vi.fn(),
  deleteTicketCategory: vi.fn(),
}));
import * as service from '../src/services/ticket.service.ts';

const res = () => {
  const r: any = {};
  r.status = vi.fn().mockReturnValue(r);
  r.json = vi.fn().mockReturnValue(r);
  return r;
};

describe('ticket.controller', () => {
  beforeEach(() => vi.clearAllMocks());

  it('postValidateTicket: exige eventId y code', async () => {
    const req: any = { body: {} };
    await expect(postValidateTicket(req, res())).rejects.toThrow(/eventId.*code/i);
  });

  it('getTicketsForEvent: retorna categorías del evento', async () => {
    (service.listTicketsByEvent as any).mockResolvedValue([{ category: 'General' }]);
    const req: any = { params: { eventId: 'e1' } };
    const r = res();
    await getTicketsForEvent(req, r);
    expect(r.json).toHaveBeenCalledWith([{ category: 'General' }]);
  });

  it('postTicket: exige eventId, category, price, quantityAvailable', async () => {
    const req: any = { user: { id: 'u1', role: 'organizer' }, body: { eventId: 'e1', category: 'VIP', price: 50, quantityAvailable: 5 } };
    const r = res();
    (service.createTicketCategory as any).mockResolvedValue({ ok: true });
    await postTicket(req, r);
    expect(r.status).toHaveBeenCalledWith(201);
  });

  it('putTicket: exige id y eventId', async () => {
    const req: any = { user: { id: 'u1', role: 'organizer' }, params: { id: 'tt1' }, body: { eventId: 'e1', price: 99 } };
    const r = res();
    (service.updateTicketCategory as any).mockResolvedValue({ _id: 'tt1', price: 99 });
    await putTicket(req, r);
    expect(r.json).toHaveBeenCalledWith({ _id: 'tt1', price: 99 });
  });

  it('deleteTicket: exige id y eventId', async () => {
    const req: any = { user: { id: 'u1', role: 'organizer' }, params: { id: 'tt1' }, query: { eventId: 'e1' } };
    const r = res();
    (service.deleteTicketCategory as any).mockResolvedValue({ ok: true, id: 'tt1' });
    await deleteTicket(req, r);
    expect(r.json).toHaveBeenCalledWith({ ok: true, id: 'tt1' });
  });
});
