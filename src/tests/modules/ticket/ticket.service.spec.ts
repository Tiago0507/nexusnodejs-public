import mongoose from 'mongoose';
import createHttpError from 'http-errors';

// ✅ SIN el “src/” extra
import TicketService from '../../../modules/ticket/ticket.service';

jest.mock('../../../modules/ticket/ticket.model', () => {
    const query = (result: any) => ({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(result),
    });

    return {
        __esModule: true,
        default: {
            create: jest.fn(),
            find: jest.fn(),
            countDocuments: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
            findOne: jest.fn(),
            findOneAndUpdate: jest.fn(),
            __query: query,
        },
    };
});

import TicketModelModule from '../../../modules/ticket/ticket.model';
const TicketModel = TicketModelModule as any;

const oid = () => new mongoose.Types.ObjectId().toHexString();

describe('TicketService', () => {
    beforeEach(() => jest.clearAllMocks());

    test('createOne -> retorna el documento creado', async () => {
        const eventId = oid();
        const typeId = oid();
        const userId = oid();

        const created = {
            _id: oid(),
            eventId, typeId, userId,
            category: 'VIP', price: 100,
            isValidated: false,
            ticketCode: 'fixedCode',
            qrCodeHash: 'fixedHash',
            toObject: function () { return { ...this }; },
        };
        TicketModel.create.mockResolvedValue(created);

        const doc = await TicketService.createOne({
            eventId, typeId, userId,
            category: 'VIP',
            price: 100,
            ticketCode: 'fixedCode',
            qrCodeHash: 'fixedHash',
        });

        expect(TicketModel.create).toHaveBeenCalledTimes(1);
        expect(doc).toMatchObject({
            eventId, typeId, userId, category: 'VIP', price: 100, isValidated: false,
        });
    });

    test('getById -> 400 si id inválido', async () => {
        await expect(TicketService.getById('no-es-oid')).rejects.toMatchObject({ status: 400 });
    });

    test('getById -> retorna el documento cuando existe', async () => {
        const id = oid();
        TicketModel.findById.mockReturnValue({ lean: jest.fn().mockResolvedValue({ _id: id, ticketCode: 'X' }) });
        const doc = await TicketService.getById(id);
        expect(doc._id).toBe(id);
    });

    test('list -> pagina y total correctos', async () => {
        // setup find + countDocuments
        TicketModel.find.mockReturnValue(TicketModel.__query([{ _id: oid() }]));
        TicketModel.countDocuments.mockResolvedValue(1);

        const res = await TicketService.list({ page: 1, limit: 10 });
        expect(res.total).toBe(1);
        expect(res.items).toHaveLength(1);
    });

    test('update -> 404 si no encuentra', async () => {
        const id = oid();
        TicketModel.findByIdAndUpdate.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
        await expect(TicketService.update(id, { category: 'GENERAL' })).rejects.toMatchObject({ status: 404 });
    });

    test('remove -> ok true cuando elimina', async () => {
        const id = oid();
        TicketModel.findByIdAndDelete.mockReturnValue({ lean: jest.fn().mockResolvedValue({ _id: id }) });
        const res = await TicketService.remove(id);
        expect(res).toEqual({ ok: true });
    });

    test('validateByCode -> 404 si no existe', async () => {
        TicketModel.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
        await expect(TicketService.validateByCode('ABC')).rejects.toMatchObject({ status: 404 });
    });

    test('useByCode -> 400 si ya estaba validado o no existe', async () => {
        TicketModel.findOneAndUpdate.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
        await expect(TicketService.useByCode('ABC')).rejects.toMatchObject({ status: 400 });
    });

    test('useByCode -> marca como validado', async () => {
        TicketModel.findOneAndUpdate.mockReturnValue({ lean: jest.fn().mockResolvedValue({ _id: oid(), isValidated: true }) });
        const res = await TicketService.useByCode('ABC');
        expect(res.isValidated).toBe(true);
    });
});

// 🧪 createOne: genera ticketCode/qrCodeHash cuando no vienen
test('createOne -> genera ticketCode y qrCodeHash por defecto', async () => {
    const eventId = oid();
    const typeId = oid();

    let payloadCreado: any;
    TicketModel.create.mockImplementation(async (doc: any) => {
        payloadCreado = doc;
        return { ...doc, _id: oid(), toObject: function () { return { ...this }; } };
    });

    const doc = await TicketService.createOne({
        eventId, typeId, category: 'GENERAL', price: 1,
        // sin ticketCode ni qrCodeHash
    } as any);

    expect(TicketModel.create).toHaveBeenCalledTimes(1);
    // hex de 8 (randomBytes(4)) y hash sha256 de 64
    expect(payloadCreado.ticketCode).toMatch(/^[0-9a-f]{8}$/i);
    expect(payloadCreado.qrCodeHash).toMatch(/^[0-9a-f]{64}$/i);
    expect(doc.isValidated).toBe(false);
});

// ❌ list: eventId inválido -> 400
test('list -> 400 cuando eventId inválido', async () => {
    await expect(TicketService.list({ eventId: 'NOPE' } as any))
        .rejects.toMatchObject({ status: 400 });
});

// ❌ list: userId inválido -> 400
test('list -> 400 cuando userId inválido', async () => {
    await expect(TicketService.list({ userId: 'NOPE' } as any))
        .rejects.toMatchObject({ status: 400 });
});

// ✅ list: isValidated true/false llega al filtro
test('list -> setea isValidated=true/false en el filtro', async () => {
    const spyFind = jest.spyOn(TicketModel, 'find');

    // true
    TicketModel.find.mockReturnValue(TicketModel.__query([]));
    TicketModel.countDocuments.mockResolvedValue(0);
    await TicketService.list({ isValidated: 'true' } as any);
    expect(spyFind).toHaveBeenLastCalledWith({ isValidated: true });

    // false
    TicketModel.find.mockReturnValue(TicketModel.__query([]));
    TicketModel.countDocuments.mockResolvedValue(0);
    await TicketService.list({ isValidated: 'false' } as any);
    expect(spyFind).toHaveBeenLastCalledWith({ isValidated: false });

    spyFind.mockRestore();
});

// ❌ update: typeId inválido -> 400
test('update -> 400 cuando typeId inválido', async () => {
    const id = oid();
    await expect(TicketService.update(id, { typeId: 'NOPE' } as any))
        .rejects.toMatchObject({ status: 400 });
});

// ✅ update: category se guarda en MAYÚSCULAS
test('update -> convierte category a mayúsculas', async () => {
    const id = oid();
    const lean = jest.fn().mockResolvedValue({ _id: id, category: 'VIP' });
    TicketModel.findByIdAndUpdate.mockReturnValue({ lean });

    await TicketService.update(id, { category: 'vip' });
    const args = TicketModel.findByIdAndUpdate.mock.calls[0][1]; // { $set: { category: 'VIP' }, ... }
    expect(args.$set.category).toBe('VIP');
});

// ❌ update: price inválido -> 400
test('update -> 400 cuando price inválido', async () => {
    const id = oid();
    await expect(TicketService.update(id, { price: -5 } as any))
        .rejects.toMatchObject({ status: 400 });
});

// ✅ update: userId=null limpia el campo
test('update -> userId=null elimina el userId', async () => {
    const id = oid();
    const lean = jest.fn().mockResolvedValue({ _id: id });
    TicketModel.findByIdAndUpdate.mockReturnValue({ lean });

    await TicketService.update(id, { userId: null });
    const args = TicketModel.findByIdAndUpdate.mock.calls[0][1];
    expect(args.$set.userId).toBeUndefined();
});

// ❌ update: userId inválido -> 400
test('update -> 400 cuando userId inválido', async () => {
    const id = oid();
    await expect(TicketService.update(id, { userId: 'NOPE' } as any))
        .rejects.toMatchObject({ status: 400 });
});

// ❌ remove: 404 cuando no encuentra
test('remove -> 404 cuando no encuentra', async () => {
    const id = oid();
    TicketModel.findByIdAndDelete.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
    await expect(TicketService.remove(id)).rejects.toMatchObject({ status: 404 });
});
