import { Types } from 'mongoose';
import { EventService } from '../../../modules/event/event.service';

// --- MOCK EventModel como constructor + estáticos usados por el service ---
jest.mock('../../../modules/event/event.model', () => {
    const ctor: any = jest.fn(); // "new EventModel(...)"
    // métodos estáticos que utiliza el service
    ctor.find = jest.fn();
    ctor.findById = jest.fn();
    ctor.findByIdAndUpdate = jest.fn();
    ctor.findByIdAndDelete = jest.fn();
    return { __esModule: true, default: ctor };
});

// --- MOCK PurchaseModel solo con countDocuments ---
jest.mock('../../../modules/purchase/purchase.model', () => ({
    __esModule: true,
    default: { countDocuments: jest.fn() },
}));

// Importa módulos ya mockeados arriba
import EventModelModule from '../../../modules/event/event.model';
import PurchaseModelModule from '../../../modules/purchase/purchase.model';

const EventModel = EventModelModule as any;       // constructor mockeado (jest.fn)
const PurchaseModel = PurchaseModelModule as any; // { countDocuments: jest.fn() }
const svc = new EventService();

const oid = () => new Types.ObjectId().toHexString();

describe('EventService', () => {
    beforeEach(() => jest.clearAllMocks());

    test('createEvent -> setea organizer y status= pending-approval', async () => {
        const organizerId = oid();
        const save = jest.fn();

        // Simula "new EventModel({...})" devolviendo una instancia con save()
        (EventModel as jest.Mock).mockImplementationOnce((payload: any) => ({
            ...payload,
            save,
        }));

        const event = await svc.createEvent(
            { title: 'X', description: 'd', date: new Date(), venue: { city: 'C' }, category: 'music' } as any,
            organizerId
        );

        expect(EventModel).toHaveBeenCalledTimes(1);
        expect(event.organizer).toBeDefined();
        expect((event as any).status).toBe('pending-approval');
        expect(save).toHaveBeenCalledTimes(1);
    });

    test('findAllEvents -> buyer solo ve published', async () => {
        EventModel.find.mockReturnValue({
            populate: jest.fn().mockReturnThis(),
            sort: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue([{ _id: 'e1', status: 'published' }]),
        });

        const res = await svc.findAllEvents({ page: 1, limit: 5 }, 'buyer');
        expect(res).toHaveLength(1);
        const q = EventModel.find.mock.calls[0][0];
        expect(q.status).toBe('published');
    });

    test('findAllEvents -> admin puede filtrar por status', async () => {
        EventModel.find.mockReturnValue({
            populate: jest.fn().mockReturnThis(),
            sort: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue([{ _id: 'e1', status: 'draft' }]),
        });

        await svc.findAllEvents({ status: 'draft' }, 'admin');
        const q = EventModel.find.mock.calls[0][0];
        expect(q.status).toBe('draft');
    });

    test('findAllEvents -> aplica search / category / city / rango de fechas', async () => {
        EventModel.find.mockReturnValue({
            populate: jest.fn().mockReturnThis(),
            sort: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue([]),
        });

        await svc.findAllEvents(
            {
                search: 'rock',
                category: 'music',
                city: 'Cali',
                dateFrom: '2025-01-01',
                dateTo: '2025-12-31',
            },
            'organizer'
        );

        const q = EventModel.find.mock.calls[0][0];
        expect(q.title.$regex).toBe('rock');
        expect(q.category).toBe('music');
        expect(q['venue.city']).toBe('Cali');
        expect(q.date.$gte).toBeInstanceOf(Date);
        expect(q.date.$lte).toBeInstanceOf(Date);
    });

    test('findEventById -> 404 cuando no existe', async () => {
        EventModel.findById.mockReturnValue({
            populate: jest.fn().mockResolvedValue(null),
        });
        await expect(svc.findEventById(oid())).rejects.toMatchObject({ statusCode: 404 });
    });

    test('findEventById -> devuelve el evento', async () => {
        EventModel.findById.mockReturnValue({
            populate: jest.fn().mockResolvedValue({ _id: 'e1' }),
        });
        const ev = await svc.findEventById(oid());
        expect(ev._id).toBe('e1');
    });

    test('updateEvent -> 404 si no existe', async () => {
        EventModel.findByIdAndUpdate.mockResolvedValue(null);
        await expect(svc.updateEvent(oid(), { title: 'X' })).rejects.toMatchObject({ statusCode: 404 });
    });

    test('updateEvent -> ok', async () => {
        EventModel.findByIdAndUpdate.mockResolvedValue({ _id: 'e1', title: 'X' });
        const ev = await svc.updateEvent(oid(), { title: 'X' });
        expect(ev.title).toBe('X');
    });

    test('deleteEvent -> 409 si hay compras', async () => {
        PurchaseModel.countDocuments.mockResolvedValue(3);
        await expect(svc.deleteEvent(oid())).rejects.toMatchObject({ statusCode: 409 });
    });

    test('deleteEvent -> 404 si no existe', async () => {
        PurchaseModel.countDocuments.mockResolvedValue(0);
        EventModel.findByIdAndDelete.mockResolvedValue(null);
        await expect(svc.deleteEvent(oid())).rejects.toMatchObject({ statusCode: 404 });
    });

    test('deleteEvent -> ok cuando no hay compras y existe', async () => {
        PurchaseModel.countDocuments.mockResolvedValue(0);
        EventModel.findByIdAndDelete.mockResolvedValue({ _id: 'e1' });
        await expect(svc.deleteEvent(oid())).resolves.toBeUndefined();
    });
});
