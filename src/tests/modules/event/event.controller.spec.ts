import request from 'supertest';
import express from 'express';
import { ApiError } from '../../../utils/errors/ApiError';

// ─────────────────────────────────────────────────────────────────────────────
// Mock de middlewares de auth
// ─────────────────────────────────────────────────────────────────────────────
let currentUser: any = null;

jest.mock('../../../modules/auth/middlewares/authentication.middleware', () => ({
    __esModule: true,
    authenticate: (req: any, _res: any, next: any) => {
        if (currentUser) req.user = currentUser;
        next();
    },
}));

jest.mock('../../../modules/auth/middlewares/authorization.middleware', () => ({
    __esModule: true,
    hasPermission: () => (_req: any, _res: any, next: any) => next(),
}));

// ─────────────────────────────────────────────────────────────────────────────
// Setup por test: aislamos módulos, mockeamos EventService ANTES de cargar rutas
// ─────────────────────────────────────────────────────────────────────────────
let app: express.Express;
let Svc: any; // instancia mockeada que usa el controller internamente

const buildApp = () => {
    jest.resetModules();
    currentUser = null;

    // Creamos las funciones mockeadas de instancia que el controller va a usar
    const instance = {
        createEvent: jest.fn(),
        findAllEvents: jest.fn(),
        findEventById: jest.fn(),
        findEventsByOrganizer: jest.fn(),
        updateEvent: jest.fn(),
        deleteEvent: jest.fn(),
    };

    // Registramos el mock del módulo EventService ANTES de requerir rutas
    jest.doMock('../../../modules/event/event.service', () => {
        const EventService = jest.fn(() => instance);
        return { __esModule: true, EventService };
    });

    // Requerimos rutas ya con el mock aplicado
    // (usar require en lugar de import para respetar el orden)
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const routes = require('../../../modules/event/event.routes').default;

    const _app = express();
    _app.use(express.json());
    _app.use('/events', routes);

    // Exponemos la instancia para que los tests la configuren
    Svc = instance;
    return _app;
};

describe('EventController (routes)', () => {
    beforeEach(() => {
        app = buildApp();
    });

    test('GET /events -> 200 lista', async () => {
        Svc.findAllEvents.mockResolvedValue([{ _id: 'e1', title: 'Rock' }]);

        const r = await request(app).get('/events?search=ro');
        expect(r.status).toBe(200);
        expect(Array.isArray(r.body)).toBe(true);
        expect(Svc.findAllEvents).toHaveBeenCalledTimes(1);
    });

    test('GET /events/:id -> 200 detalle', async () => {
        Svc.findEventById.mockResolvedValue({ _id: 'e1', title: 'Rock' });

        const r = await request(app).get('/events/aaaaaaaaaaaaaaaaaaaaaaaa');
        expect(r.status).toBe(200);
        expect(r.body._id).toBe('e1');
    });

    test('GET /events/organizer/:id -> 200 del organizador (auth ok)', async () => {
        Svc.findEventsByOrganizer.mockResolvedValue([{ _id: 'e1' }]);

        currentUser = { id: 'u1', role: { name: 'organizer' } };

        const r = await request(app).get('/events/organizer/111111111111111111111111');
        expect(r.status).toBe(200);
        expect(Array.isArray(r.body)).toBe(true);
        expect(Svc.findEventsByOrganizer).toHaveBeenCalledWith('111111111111111111111111');
    });

    test('POST /events -> 201 crea (organizer)', async () => {
        Svc.createEvent.mockResolvedValue({ _id: 'e1', title: 'New' });

        currentUser = { id: 'org1', role: { name: 'organizer' } };

        const payload = { title: 'New', description: 'd', date: new Date(), venue: { city: 'C' }, category: 'music' };
        const r = await request(app).post('/events').send(payload);

        expect(r.status).toBe(201);
        expect(r.body._id).toBe('e1');
        expect(Svc.createEvent).toHaveBeenCalledTimes(1);
    });

    test('PUT /events/:id -> 403 si no es owner ni admin', async () => {
        Svc.findEventById.mockResolvedValue({
            _id: 'e1',
            organizer: { _id: { toString: () => 'ownerId' } },
        });

        currentUser = { id: 'intruder', role: { name: 'organizer' } };

        const r = await request(app).put('/events/eeeeeeeeeeeeeeeeeeeeeeee').send({ title: 'upd' });
        expect(r.status).toBe(403);
        expect(r.body?.error?.code).toBe('FORBIDDEN');
    });

    test('PUT /events/:id -> 200 actualiza y quita "status" si no es admin', async () => {
        Svc.findEventById.mockResolvedValue({
            _id: 'e1',
            organizer: { _id: { toString: () => 'me' } },
        });
        Svc.updateEvent.mockResolvedValue({ _id: 'e1', status: 'draft', title: 'upd' });

        currentUser = { id: 'me', role: { name: 'organizer' } };

        const r = await request(app).put('/events/eeeeeeeeeeeeeeeeeeeeeeee').send({ title: 'upd', status: 'published' });
        expect(r.status).toBe(200);
        expect(Svc.updateEvent).toHaveBeenCalled();

        const patchArg = Svc.updateEvent.mock.calls[0][1];
        expect(patchArg.status).toBeUndefined(); // el controller elimina "status" si no es admin
        expect(patchArg.title).toBe('upd');
    });

    test('PUT /events/:id -> 200 admin puede cambiar status', async () => {
        Svc.findEventById.mockResolvedValue({
            _id: 'e1',
            organizer: { _id: { toString: () => 'someone' } },
        });
        Svc.updateEvent.mockResolvedValue({ _id: 'e1', status: 'published' });

        currentUser = { id: 'admin1', role: { name: 'admin' } };

        const r = await request(app).put('/events/eeeeeeeeeeeeeeeeeeeeeeee').send({ status: 'published' });
        expect(r.status).toBe(200);

        const patchArg = Svc.updateEvent.mock.calls[0][1];
        expect(patchArg.status).toBe('published');
    });

    test('DELETE /events/:id -> 403 si no es owner ni admin', async () => {
        Svc.findEventById.mockResolvedValue({
            _id: 'e1',
            organizer: { _id: { toString: () => 'owner' } },
        });

        currentUser = { id: 'stranger', role: { name: 'organizer' } };

        const r = await request(app).delete('/events/eeeeeeeeeeeeeeeeeeeeeeee');
        expect(r.status).toBe(403);
        expect(r.body?.error?.code).toBe('FORBIDDEN');
    });

    test('DELETE /events/:id -> 204 ok', async () => {
        Svc.findEventById.mockResolvedValue({
            _id: 'e1',
            organizer: { _id: { toString: () => 'me' } },
        });
        Svc.deleteEvent.mockResolvedValue(undefined);

        currentUser = { id: 'me', role: { name: 'organizer' } };

        const r = await request(app).delete('/events/eeeeeeeeeeeeeeeeeeeeeeee');
        expect(r.status).toBe(204);
    });

    test('GET /events -> 500 cuando service lanza error no ApiError', async () => {
        Svc.findAllEvents.mockRejectedValue(new Error('boom'));

        const r = await request(app).get('/events');
        expect(r.status).toBe(500);
    });

});
