import { describe, it, expect } from 'vitest';
import { rbac } from '../src/middlewares/rbac.ts';

const run = (mw: any, req: any) => new Promise((resolve, reject) => mw(req, {} as any, (e?: any) => e ? reject(e) : resolve(null)));

describe('middlewares/rbac', () => {
  it('permite roles correctos', async () => {
    const mw = rbac(['organizer', 'superadmin']);
    await expect(run(mw, { user: { role: 'organizer' } })).resolves.toBeNull();
  });
  it('bloquea roles inválidos', async () => {
    const mw = rbac(['superadmin']);
    await expect(run(mw, { user: { role: 'user' } })).rejects.toThrow();
  });
});
