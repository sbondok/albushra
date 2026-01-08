import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as paymentsRoute from '../../src/app/api/payments/route';
import { getServerSession } from 'next-auth';

vi.mock('next-auth', () => ({ getServerSession: vi.fn() }));
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
    payment: {
      findMany: vi.fn().mockResolvedValue([{ id: 'p1', amount: 100 }])
    },
  }))
}));

describe('payments API auth', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('GET returns 401 when unauthenticated', async () => {
    (getServerSession as any).mockResolvedValue(null);
    const res: any = await paymentsRoute.GET({ url: 'http://localhost/api/payments' } as any);
    expect(res.status).toBe(401);
  });

  it('GET returns payments when authenticated', async () => {
    (getServerSession as any).mockResolvedValue({ user: { id: 'u1', role: 'admin' } });
    const res: any = await paymentsRoute.GET({ url: 'http://localhost/api/payments' } as any);
    const data = await (res.json ? res.json() : res);
    expect(data).toEqual([{ id: 'p1', amount: 100 }]);
  });

  it('POST returns 401 when unauthenticated', async () => {
    (getServerSession as any).mockResolvedValue(null);
    const req = { json: async ()=> ({ guardianId: 1, amount: 50 }) } as any;
    const res: any = await paymentsRoute.POST(req);
    expect(res.status).toBe(401);
  });

  it('POST returns 403 when role is insufficient', async () => {
    (getServerSession as any).mockResolvedValue({ user: { id: 'u1', role: 'viewer' } });
    const req = { json: async ()=> ({ guardianId: 1, amount: 50 }) } as any;
    const res: any = await paymentsRoute.POST(req);
    expect(res.status).toBe(403);
  });
});
