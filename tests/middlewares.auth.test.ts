import { describe, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';
import { auth } from '../src/middlewares/auth.ts';

const run = (mw: any, req: any) => new Promise((resolve, reject) => mw(req, {} as any, (e?: any) => e ? reject(e) : resolve(null)));

describe('middlewares/auth', () => {
  it('pasa con token válido', async () => {
    const token = jwt.sign({ sub: 'u1', role: 'organizer' }, process.env.JWT_SECRET!);
    const req: any = { header: () => `Bearer ${token}` };
    await expect(run(auth, req)).resolves.toBeNull();
    expect(req.user).toEqual({ id: 'u1', role: 'organizer' });
  });

  it('falla sin token', async () => {
    const req: any = { header: () => undefined };
    await expect(run(auth, req)).rejects.toThrow(/token/i);
  });
});
