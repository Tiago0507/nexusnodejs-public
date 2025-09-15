import { assertCreateTicketDTO, sanitizeUpdateTicketDTO } from '../../../modules/ticket/dto';

describe('DTO - assertCreateTicketDTO', () => {
    test('ok con payload válido', () => {
        const body = { eventId: 'a', typeId: 'b', category: 'GENERAL', price: 10 };
        expect(() => assertCreateTicketDTO(body as any)).not.toThrow();
    });

    test('falla sin eventId', () => {
        const body = { typeId: 'b', category: 'GENERAL', price: 10 };
        expect(() => assertCreateTicketDTO(body as any)).toThrow(/eventId requerido/);
    });

    test('falla sin typeId', () => {
        const body = { eventId: 'a', category: 'GENERAL', price: 10 };
        expect(() => assertCreateTicketDTO(body as any)).toThrow(/typeId requerido/);
    });

    test('falla sin category', () => {
        const body = { eventId: 'a', typeId: 'b', price: 10 };
        expect(() => assertCreateTicketDTO(body as any)).toThrow(/category requerido/);
    });

    test('falla con price inválido', () => {
        const body = { eventId: 'a', typeId: 'b', category: 'GENERAL', price: -1 };
        expect(() => assertCreateTicketDTO(body as any)).toThrow(/price inválido/);
    });
});

describe('DTO - sanitizeUpdateTicketDTO', () => {
    test('normaliza price y copia campos válidos', () => {
        const out = sanitizeUpdateTicketDTO({
            typeId: 'x', category: 'vip', price: '15', isValidated: true, userId: 'u'
        } as any);
        expect(out).toEqual({ typeId: 'x', category: 'vip', price: 15, isValidated: true, userId: 'u' });
    });

    test('price inválido lanza error', () => {
        expect(() => sanitizeUpdateTicketDTO({ price: -1 } as any)).toThrow(/price inválido/);
    });

    test('userId=null se conserva para limpiar', () => {
        const out = sanitizeUpdateTicketDTO({ userId: null } as any);
        expect(out).toEqual({ userId: null });
    });

    test('payload no-objeto -> objeto vacío', () => {
        // @ts-expect-error
        expect(sanitizeUpdateTicketDTO(null)).toEqual({});
    });
});
