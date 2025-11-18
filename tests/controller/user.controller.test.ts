import request from './_request.js';
import { buildTestApp } from './_app.js';
import userRoutes from '../../router/userRoutes.js';
import { UserService } from '../../service/userService.js';
import * as ExpressPkg from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Controller: User', () => {
  const app = buildTestApp((a) => {
    a.use('/api/user', userRoutes);
  });

  let userId: number | null = null;

  beforeAll(async () => { await prisma.$connect(); });
  afterAll(async () => { await prisma.$disconnect(); });
  afterEach(async () => { if (userId) { try { await prisma.user.delete({ where: { id: userId } }); } catch {} userId = null; } });

  it('GET /api/user/profile/:id returns profile for verified user', async () => {
    const user = await prisma.user.create({ data: { email: `u-${Date.now()}@ku.th`, role: 'Student', verified: true, status: 'Approved' } });
    userId = user.id;
    await prisma.employeeProfile.create({ data: { user_id: user.id } });

    const res = await request(app)
      .get(`/api/user/profile/${user.id}`)
      .set('x-user-id', String(user.id))
      .set('x-role', 'Student')
      .set('x-verified', 'true');

    expect(res.status).toBe(200);
    expect(res.body.data.user_id).toBe(user.id);
  });

  it('POST /api/user/sign-up returns 201 with data', async () => {
    const spy = jest.spyOn(UserService.prototype, 'sign_up').mockResolvedValue({ id: 999 } as any);
    const res = await request(app)
      .post('/api/user/sign-up')
      .send({ email: `new-${Date.now()}@ku.th`, password: 'x', confirm_password: 'x', role: 'Student', stdId: '6600000000' });
    expect(res.status).toBe(201);
    expect(res.body?.data?.id).toBe(999);
    spy.mockRestore();
  });

  it('POST /api/user/login sets cookies and returns tokens', async () => {
    const spy = jest.spyOn(UserService.prototype, 'login').mockResolvedValue({ access_token: 'a', refresh_token: 'r' } as any);
    const res = await request(app)
      .post('/api/user/login')
      .send({ user_name: 'u', password: 'p' });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.headers['set-cookie'])).toBe(true);
    spy.mockRestore();
  });

  it('POST /api/user/refresh-token returns new access token (with cookies)', async () => {
    const spy = jest.spyOn(UserService.prototype, 'refresh_token').mockResolvedValue({ access_token: 'n' } as any);
    // Build a fresh app with a "cookies" injector before the router
    const express: any = (ExpressPkg as any).default || (ExpressPkg as any);
    const app2: any = express();
    app2.use(express.json());
    app2.use((req: any, _res: any, next: any) => { req.user = { id: 1, role: 'Student', verified: true }; next(); });
    app2.use((req: any, _res: any, next: any) => { req.cookies = { refresh_token: 'dummy' }; next(); });
    app2.use('/api/user', userRoutes);

    const res = await request(app2)
      .post('/api/user/refresh-token');
    expect(res.status).toBe(200);
    expect(res.body?.data?.access_token).toBe('n');
    spy.mockRestore();
  });

  it('GET /api/user/logout clears cookie and returns 200', async () => {
    const res = await request(app)
      .get('/api/user/logout');
    expect(res.status).toBe(200);
    expect(res.body?.message).toMatch(/Logout successful/);
  });

  it('PATCH /api/user/role updates role and sets cookies', async () => {
    const spy = jest.spyOn(UserService.prototype, 'update_role').mockResolvedValue({ access_token: 'a', refresh_token: 'r' } as any);
    const res = await request(app)
      .patch('/api/user/role')
      .set('x-user-id', '1')
      .set('x-role', 'Student')
      .send({ role: 'Student' });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.headers['set-cookie'])).toBe(true);
    spy.mockRestore();
  });
});
