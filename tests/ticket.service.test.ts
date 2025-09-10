import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../src/repositories/ticket.repo.ts', () => ({
  validateTicketOnce: vi.fn(),
}));
vi.mock('../src/repositories/event.repo.ts', () => ({
  listTicketTypesByEvent: vi.fn(),
  createTicketType: vi.fn(),
  updateTicketType: vi.fn(),
  deleteTicketType: vi.fn(),
}));

import { validateTicket, listTicketsByEvent, createTicketCategory, updateTicketCategory } from '../src/services/ticket.service.ts';
import * as ticketRepo from '../src/repositories/ticket.repo.ts';
import * as eventRepo from '../src/repositories/event.repo.ts';

describe('ticket.service', () => {
  beforeEach(() => vi.clearAllMocks());

  it('validateTicket: marca ticket como usado una sola vez', async () => {
    (ticketRepo.validateTicketOnce as any).mockResolvedValue({ _id: 't123' });
    const out = await validateTicket({ eventId: 'e1', code: 'ABC' });
    expect(out).toEqual({ ok: true, ticketId: 't123' });
  });

  it('validateTicket: lanza si no existe o ya usado', async () => {
    (ticketRepo.validateTicketOnce as any).mockResolvedValue(null);
    await expect(validateTicket({ eventId: 'e1', code: 'XYZ' })).rejects.toThrow(/inválido|usado/i);
  });

  it('listTicketsByEvent: retorna categorías embebidas', async () => {
    (eventRepo.listTicketTypesByEvent as any).mockResolvedValue([{ category: 'General', price: 10 }]);
    const r = await listTicketsByEvent('e1');
    expect(r).toHaveLength(1);
  });

  it('createTicketCategory: solo organizer o superadmin', async () => {
    await expect(createTicketCategory({ eventId: 'e1', category: 'VIP', price: 50, quantityAvailable: 5 }, { userId: 'u1', role: 'user' }))
      .rejects.toThrow(/organizer|superadmin/i);

    (eventRepo.createTicketType as any).mockResolvedValue({ category: 'VIP', price: 50 });
    const ok = await createTicketCategory({ eventId: 'e1', category: 'VIP', price: 50, quantityAvailable: 5 }, { userId: 'u1', role: 'organizer' });
    expect(ok.category).toBe('VIP');
  });

  it('updateTicketCategory: exige eventId', async () => {
    await expect(updateTicketCategory('tt1', {}, { userId: 'u1', role: 'organizer' }))
      .rejects.toThrow(/eventId/i);
  });
});
