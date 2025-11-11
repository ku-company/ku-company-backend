import request from '../controller/_request.js';
import { buildTestApp } from '../controller/_app.js';
import userRoutes from '../../router/userRoutes.js';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

describe('Security: Refresh token rotation & revocation', () => {
  let app: any;
  let userName = `rr${Date.now()}`;
  let userId: number;
  let email: string;

  beforeAll(async () => {
    process.env.SECRET_KEY = process.env.SECRET_KEY || 'test-secret';
    process.env.REFRESH_KEY = process.env.REFRESH_KEY || 'test-refresh';
    await prisma.$connect();
    const password_hash = await bcrypt.hash('StrongPass123!', 10);
    const created = await prisma.user.create({
      data: {
        email: `rr-${Date.now()}@ku.th`,
        user_name: userName,
        password_hash,
        role: 'Student',
        verified: true,
        status: 'Approved'
      }
    });
    userId = created.id;
    email = created.email as string;
    app = buildTestApp(a => { a.use('/api/user', userRoutes); });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('old refresh token is revoked after rotation', async () => {
    // Create an initial refresh token manually
    const payload = { id: userId, user_name: userName, email, role: 'Student', verified: true } as any;
    const initial = jwt.sign(payload, process.env.REFRESH_KEY as string, { algorithm: 'HS256', expiresIn: '5m' });

    // first refresh using body
  const first = await request(app).post('/api/user/refresh-token').send({ refresh_token: initial });
  expect(first.status).toBe(200);
  const newCookies = first.headers?.['set-cookie'] as string[] | undefined;
    const extractCookie = (cookies: string[] | undefined, name: string) => {
      if (!cookies) return undefined;
      for (const c of cookies) {
        const firstSegment = (c && c.split(';')[0]) ?? '';
        const parts = firstSegment.split('=');
        if (parts.length === 2) {
          const [k, v] = parts;
          if (k === name) return v;
        }
      }
      return undefined;
    };
    const rotated = extractCookie(newCookies, 'refresh_token');

    // second refresh using old token should fail (revoked)
    const second = await request(app).post('/api/user/refresh-token').send({ refresh_token: initial });
    expect(second.status).toBe(400);
    expect(second.body.message).toMatch(/invalid refresh token/i);

    // We only assert revocation of the old token; success path covered by service tests
    expect(rotated).toBeDefined();
  });

  test('logout revokes refresh token', async () => {
    const payload = { id: userId, user_name: userName, email, role: 'Student', verified: true } as any;
    const initial = jwt.sign(payload, process.env.REFRESH_KEY as string, { algorithm: 'HS256', expiresIn: '5m' });
    // Simulate cookie
    const cookie = [`refresh_token=${initial}; HttpOnly`];
    const logout = await request(app).post('/api/user/logout').set('Cookie', cookie);
    expect(logout.status).toBe(200);
    const refresh = await request(app).post('/api/user/refresh-token').send({ refresh_token: initial });
    expect(refresh.status).toBe(400);
  });
});
