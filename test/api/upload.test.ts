import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as uploadRoute from '../../src/app/api/upload/route';
import { getServerSession } from 'next-auth';

vi.mock('next-auth', () => ({ getServerSession: vi.fn() }));
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({}))
}));

describe('upload API auth and validation', () => {
  beforeEach(()=> vi.clearAllMocks());

  it('POST returns 401 when unauthenticated', async () => {
    (getServerSession as any).mockResolvedValue(null);
    const req = { json: async ()=> ({ rows: [] }) } as any;
    const res: any = await uploadRoute.POST(req);
    expect(res.status).toBe(401);
  });

  it('POST returns 403 when role insufficient', async () => {
    (getServerSession as any).mockResolvedValue({ user: { id: 'u1', role: 'viewer' } });
    const req = { json: async ()=> ({ rows: [] }) } as any;
    const res: any = await uploadRoute.POST(req);
    expect(res.status).toBe(403);
  });

  it('POST returns 400 for invalid payload', async () => {
    (getServerSession as any).mockResolvedValue({ user: { id: 'u1', role: 'uploader' } });
    const req = { json: async ()=> ({ rows: 'not-array' }) } as any;
    const res: any = await uploadRoute.POST(req);
    expect(res.status).toBe(400);
  });
});
