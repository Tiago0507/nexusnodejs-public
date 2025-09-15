import request from 'supertest';
import express from 'express';
import { BadRequestError } from '../../../utils/errors/ApiError';

// ⚙️ Rutas del módulo
import purchaseRoutes from '../../../modules/purchase/purchase.routes';

// 🧪 Mock de middlewares de auth para que “pasen” y seteen req.user
jest.mock('../../../modules/auth/middlewares/authentication.middleware', () => ({
    authenticate: (req: any, _res: any, next: any) => {
        // usuario falso que cumple con UserDocument minimal
        req.user = { _id: 'u'.repeat(24), email: 'buyer@test.com', role: { name: 'buyer' } };
        next();
    },
}));

jest.mock('../../../modules/auth/middlewares/authorization.middleware', () => ({
    hasPermission: () => (_req: any, _res: any, next: any) => next(),
}));

// 🧪 Mock del service usado por el controller
jest.mock('../../../modules/purchase/purchase.service', () => ({
    __esModule: true,
    purchaseService: {
        createPurchase: jest.fn(),
    },
}));

import { purchaseService } from '../../../modules/purchase/purchase.service';

const app = express();
app.use(express.json());
app.use('/purchases', purchaseRoutes);

describe('PurchaseController', () => {
    beforeEach(() => jest.clearAllMocks());

    test('POST /purchases -> 201 y cuerpo con purchase + tickets', async () => {
        (purchaseService.createPurchase as jest.Mock).mockResolvedValue({
            purchase: {
                _id: 'p'.repeat(24),
                event: 'e'.repeat(24),
                buyer: 'u'.repeat(24),
                quantity: 2,
                totalAmount: 100,
                status: 'completed',
            },
            tickets: [
                { _id: 't'.repeat(24), userId: 'u'.repeat(24), isValidated: false },
                { _id: 't'.repeat(23) + 'x', userId: 'u'.repeat(24), isValidated: false },
            ],
        });

        const body = {
            eventId: 'e'.repeat(24),
            ticketTypeId: 'k'.repeat(24),
            quantity: 2,
        };

        const r = await request(app).post('/purchases').send(body);

        expect(r.status).toBe(201);
        expect(purchaseService.createPurchase).toHaveBeenCalledTimes(1);
        expect(purchaseService.createPurchase).toHaveBeenCalledWith(
            body,
            expect.objectContaining({ _id: 'u'.repeat(24) }) // buyer inyectado por authenticate
        );
        expect(r.body.purchase).toBeDefined();
        expect(r.body.tickets).toHaveLength(2);
    });

    test('POST /purchases -> 500 para error no controlado', async () => {
        (purchaseService.createPurchase as jest.Mock).mockRejectedValue(new Error('boom'));

        const r = await request(app).post('/purchases').send({
            eventId: 'e'.repeat(24),
            ticketTypeId: 'k'.repeat(24),
            quantity: 1,
        });

        expect(r.status).toBe(500);
        expect(r.body.error).toEqual(
            expect.objectContaining({
                code: 'INTERNAL_ERROR',
            })
        );
    });
});
