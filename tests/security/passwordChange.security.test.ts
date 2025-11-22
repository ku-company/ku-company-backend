import request from '../controller/_request.js';
import { buildTestApp } from '../controller/_app.js';
import userRoutes from '../../router/userRoutes.js';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

describe('Security: Password change', () => {
  let app: any;
  let userId: number;
  let currentPassword = 'StrongPass123!';

  beforeAll(async () => {
    process.env.SECRET_KEY = process.env.SECRET_KEY || 'test-secret';
    process.env.REFRESH_KEY = process.env.REFRESH_KEY || 'test-refresh';
    await prisma.$connect();
    const password_hash = await bcrypt.hash(currentPassword, 10);
    const user = await prisma.user.create({
      data: {
        email: `pc-${Date.now()}@ku.th`,
        user_name: `pcuser${Date.now()}`,
        password_hash,
        role: 'Student',
        verified: true,
        status: 'Approved'
      }
    });
    userId = user.id;
    app = buildTestApp(a => { a.use('/api/user', userRoutes); });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('rejects wrong current password', async () => {
    const res = await request(app)
      .patch('/api/user/password')
      .set('x-user-id', String(userId))
      .send({ current_password: 'WrongPass', new_password: 'NewStrong123!', confirm_new_password: 'NewStrong123!' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/current password is incorrect/i);
  });

  test('rejects common new password', async () => {
    const res = await request(app)
      .patch('/api/user/password')
      .set('x-user-id', String(userId))
      .send({ current_password: currentPassword, new_password: 'password', confirm_new_password: 'password' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/too common/i);
  });

  test('changes password and rotates tokens', async () => {
    const res = await request(app)
      .patch('/api/user/password')
      .set('x-user-id', String(userId))
      .send({ current_password: currentPassword, new_password: 'NewStrong123!', confirm_new_password: 'NewStrong123!' });
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/password changed successfully/i);
    expect(res.headers['set-cookie']).toBeDefined();
  });
});
