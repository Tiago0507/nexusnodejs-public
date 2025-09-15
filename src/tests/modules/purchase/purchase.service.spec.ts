import { purchaseService } from '../../../modules/purchase/purchase.service';
import { NotFoundError, BadRequestError } from '../../../utils/errors/ApiError';

// 🔧 Mocks de modelos Mongoose usados por el servicio
jest.mock('../../../modules/event/event.model', () => ({
    __esModule: true,
    default: { findById: jest.fn() },
}));
jest.mock('../../../modules/purchase/purchase.model', () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(function (this: any, doc: any) {
        Object.assign(this, doc);
        this.save = jest.fn().mockResolvedValue(this);
    }),
}));
jest.mock('../../../modules/ticket/ticket.model', () => ({
    __esModule: true,
    default: { insertMany: jest.fn() },
}));

// 🔧 Mock de crypto para que los códigos sean determinísticos
jest.mock('crypto', () => ({
    __esModule: true,
    default: {
        randomBytes: () => Buffer.from('ABCD1234', 'utf8'),
        randomUUID: () => 'fixed-uuid',
        createHash: () => ({ update: () => ({ digest: () => 'fixed-hash' }) }),
    },
}));

import EventModel from '../../../modules/event/event.model';
import PurchaseModel from '../../../modules/purchase/purchase.model';
import TicketModel from '../../../modules/ticket/ticket.model';

const asMock = <T extends object>(m: T) => m as unknown as jest.Mocked<T>;
const Event = asMock(EventModel as any);
const Ticket = asMock(TicketModel as any);

// helper: evento de prueba
function makeEvent({
    published = true,
    quantityAvailable = 5,
    price = 100,
}: { published?: boolean; quantityAvailable?: number; price?: number } = {}) {
    const ttId = 'ttt000000000000000000001';
    const ev: any = {
        _id: 'evt000000000000000000001',
        status: published ? 'published' : 'draft',
        ticketTypes: [
            { _id: ttId, category: 'VIP', price, quantityAvailable },
        ],
        save: jest.fn().mockResolvedValue(true),
    };
    return { ev, ttId };
}

describe('PurchaseService.createPurchase', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('crea la compra y los tickets (happy path)', async () => {
        const { ev, ttId } = makeEvent({ published: true, quantityAvailable: 3, price: 50 });
        Event.findById.mockResolvedValue(ev);

        // 👇 añade esto:
        Ticket.insertMany.mockResolvedValue([{ _id: 't1' }, { _id: 't2' }]);

        const buyer: any = { _id: 'usr000000000000000000001' };
        const dto = { eventId: ev._id, ticketTypeId: ttId, quantity: 2 };

        const result = await purchaseService.createPurchase(dto as any, buyer);

        // …el resto igual
        expect(ev.ticketTypes[0].quantityAvailable).toBe(1);
        expect(ev.save).toHaveBeenCalled();

        // @ts-expect-error mock ctor call count
        expect(PurchaseModel).toHaveBeenCalledTimes(1);

        expect(Ticket.insertMany).toHaveBeenCalledTimes(1);
        const batch = (Ticket.insertMany as jest.Mock).mock.calls[0][0];
        expect(batch).toHaveLength(2);

        expect(result).toHaveProperty('purchase');
        expect(result.tickets).toHaveLength(2);  // ✅ ahora pasa
    });


    test('falla si el evento no existe', async () => {
        Event.findById.mockResolvedValue(null);

        await expect(
            purchaseService.createPurchase(
                { eventId: 'x', ticketTypeId: 'y', quantity: 1 } as any,
                { _id: 'usr' } as any
            )
        ).rejects.toBeInstanceOf(NotFoundError);
    });

    test('falla si el evento no está publicado', async () => {
        const { ev } = makeEvent({ published: false });
        Event.findById.mockResolvedValue(ev);

        await expect(
            purchaseService.createPurchase(
                { eventId: ev._id, ticketTypeId: 'cualquiera', quantity: 1 } as any,
                { _id: 'usr' } as any
            )
        ).rejects.toBeInstanceOf(BadRequestError);
    });

    test('falla si el ticketType no existe en el evento', async () => {
        const { ev } = makeEvent();
        ev.ticketTypes = []; // sin tipos
        Event.findById.mockResolvedValue(ev);

        await expect(
            purchaseService.createPurchase(
                { eventId: ev._id, ticketTypeId: 'nope', quantity: 1 } as any,
                { _id: 'usr' } as any
            )
        ).rejects.toBeInstanceOf(NotFoundError);
    });

    test('falla si no hay stock suficiente', async () => {
        const { ev, ttId } = makeEvent({ quantityAvailable: 1 });
        Event.findById.mockResolvedValue(ev);

        await expect(
            purchaseService.createPurchase(
                { eventId: ev._id, ticketTypeId: ttId, quantity: 3 } as any,
                { _id: 'usr' } as any
            )
        ).rejects.toBeInstanceOf(BadRequestError);

        expect(ev.save).not.toHaveBeenCalled();
        expect(Ticket.insertMany).not.toHaveBeenCalled();
    });
});
