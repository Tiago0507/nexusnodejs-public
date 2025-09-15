import request from 'supertest';
import express from 'express';
import createError from 'http-errors';


import ticketRoutes from '../../../modules/ticket/ticket.routes';

jest.mock('../../../modules/ticket/ticket.service', () => ({
    __esModule: true,
    default: {
        createOne: jest.fn(),
        list: jest.fn(),
        getById: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
        validateByCode: jest.fn(),
        useByCode: jest.fn(),
    },
}));

import TicketService from '../../../modules/ticket/ticket.service';

const app = express();
app.use(express.json());
app.use(ticketRoutes);

describe('TicketController', () => {
    beforeEach(() => jest.clearAllMocks());

    test('POST /tickets -> 201 con el ticket creado', async () => {
        (TicketService.createOne as jest.Mock).mockResolvedValue({
            _id: '665f0f2b8d3a3c0d1a1b2c3d',
            eventId: '665f0f2b8d3a3c0d1a1b2c3e',
            typeId: '665f0f2b8d3a3c0d1a1b2c3f',
            category: 'VIP',
            price: 120,
            isValidated: false,
            ticketCode: 'abcd1234',
            qrCodeHash: 'hash',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        const resp = await request(app)
            .post('/tickets')
            .send({
                eventId: '665f0f2b8d3a3c0d1a1b2c3e',
                typeId: '665f0f2b8d3a3c0d1a1b2c3f',
                category: 'VIP',
                price: 120,
            });

        expect(resp.status).toBe(201);
        expect(resp.body).toHaveProperty('_id');
        expect(TicketService.createOne).toHaveBeenCalledTimes(1);
    });

    test('GET /tickets -> 200 lista paginada', async () => {
        (TicketService.list as jest.Mock).mockResolvedValue({
            page: 1,
            limit: 2,
            total: 1,
            items: [{ _id: '665f0f2b8d3a3c0d1a1b2c3d', ticketCode: 'x' }],
        });

        const r = await request(app).get('/tickets?limit=2');
        expect(r.status).toBe(200);
        expect(r.body.items).toHaveLength(1);
        expect(TicketService.list).toHaveBeenCalledWith({ page: 1, limit: 2, eventId: undefined, userId: undefined, isValidated: undefined, });
    });

    test('GET /tickets/:id -> 404 cuando no existe', async () => {
        (TicketService.getById as jest.Mock).mockRejectedValue(createError(404, 'Ticket no encontrado'));
        const r = await request(app).get('/tickets/665f0f2b8d3a3c0d1a1b2c3d');
        expect(r.status).toBe(404);
    });


});

test('GET /tickets?eventId&userId&isValidated=true -> 200 y llama service con filtro', async () => {
    (TicketService as any).list = jest.fn().mockResolvedValue({
        page: 2, limit: 5, total: 1, items: [{ _id: 'x' }]
    });

    const eventId = '111111111111111111111111';
    const userId = '222222222222222222222222';

    const r = await request(app).get('/tickets')
        .query({ page: '2', limit: '5', eventId, userId, isValidated: 'true' });

    expect(r.status).toBe(200);
    expect(TicketService.list).toHaveBeenCalledWith({
        page: 2, limit: 5, eventId, userId, isValidated: 'true'
    });
    expect(r.body.items).toHaveLength(1);
});

test('GET /tickets/:id -> 404 cuando no existe', async () => {
    (TicketService as any).getById = jest.fn().mockRejectedValue(
        Object.assign(new Error('Ticket no encontrado'), { status: 404 })
    );

    const r = await request(app).get('/tickets/111111111111111111111111');
    expect(r.status).toBe(404);
});

test('POST /tickets -> 201 crea ticket', async () => {
    (TicketService as any).createOne = jest.fn().mockResolvedValue({
        _id: 'a'.repeat(24),
        ticketCode: 'XYZ123',
        isValidated: false,
        eventId: '1'.repeat(24),
        typeId: '2'.repeat(24),
        category: 'GENERAL',
        price: 50,
    });

    const payload = {
        eventId: '1'.repeat(24),
        typeId: '2'.repeat(24),
        category: 'GENERAL',
        price: 50
    };

    const r = await request(app).post('/tickets').send(payload);
    expect(r.status).toBe(201);
    expect(TicketService.createOne).toHaveBeenCalledWith(payload);
    expect(r.body.ticketCode).toBe('XYZ123');
});

test('DELETE /tickets/:id -> 200 ok', async () => {
    (TicketService as any).remove = jest.fn().mockResolvedValue({ ok: true });

    const r = await request(app).delete(`/tickets/${'a'.repeat(24)}`);
    expect(r.status).toBe(200);
    expect(r.body.ok).toBe(true);
});

test('GET /tickets/validate/:code -> 404 cuando no existe', async () => {
    (TicketService as any).validateByCode = jest.fn().mockRejectedValue(
        Object.assign(new Error('Ticket no encontrado'), { status: 404 })
    );

    const r = await request(app).get('/tickets/validate/NOEXISTE');
    expect(r.status).toBe(404);
});

test('POST /tickets/use/:code -> 400 ya validado', async () => {
    (TicketService as any).useByCode = jest.fn().mockRejectedValue(
        Object.assign(new Error('Ticket inválido o ya validado'), { status: 400 })
    );

    const r = await request(app).post('/tickets/use/USED');
    expect(r.status).toBe(400);
});

// ✅ éxito: validateByCode devuelve { ok:true, ticket }
test('GET /tickets/validate/:code -> 200 y envuelve en {ok,ticket}', async () => {
    (TicketService as any).validateByCode = jest.fn().mockResolvedValue({
        _id: 'a'.repeat(24),
        ticketCode: 'ABC',
        isValidated: false,
    });

    const r = await request(app).get('/tickets/validate/ABC');
    expect(r.status).toBe(200);
    expect(r.body).toEqual({
        ok: true,
        ticket: { _id: 'a'.repeat(24), ticketCode: 'ABC', isValidated: false },
    });
});

// ✅ éxito: useByCode devuelve { ok:true, ticket }
test('POST /tickets/use/:code -> 200 y envuelve en {ok,ticket}', async () => {
    (TicketService as any).useByCode = jest.fn().mockResolvedValue({
        _id: 'b'.repeat(24),
        ticketCode: 'XYZ',
        isValidated: true,
    });

    const r = await request(app).post('/tickets/use/XYZ');
    expect(r.status).toBe(200);
    expect(r.body).toEqual({
        ok: true,
        ticket: { _id: 'b'.repeat(24), ticketCode: 'XYZ', isValidated: true },
    });
});

// ❌ error de DTO: falta eventId
test('POST /tickets -> 400 cuando falta eventId', async () => {
    const r = await request(app).post('/tickets').send({
        typeId: '2'.repeat(24),
        category: 'GENERAL',
        price: 10,
    });
    expect(r.status).toBe(400);
});

// ❌ error propagado desde service en list (eventId inválido)
test('GET /tickets -> 400 cuando service lanza 400', async () => {
    (TicketService as any).list = jest.fn().mockRejectedValue(
        Object.assign(new Error('eventId inválido'), { status: 400 })
    );
    const r = await request(app).get('/tickets').query({ eventId: 'NOPE' });
    expect(r.status).toBe(400);
});
