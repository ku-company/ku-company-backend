import request from '../controller/_request.js';
import { buildTestApp } from '../controller/_app.js';
import userRoutes from '../../router/userRoutes.js';
import { UserService } from '../../service/userService.js';

describe('Validators: User', () => {
  const app = buildTestApp((a) => {
    a.use('/api/user', userRoutes);
  });

  describe('sign-up', () => {
    it('rejects invalid email and missing passwords', async () => {
      const res = await request(app)
        .post('/api/user/sign-up')
        .send({ email: 'not-an-email', role: 'Student' });
      expect(res.status).toBe(400);
      expect(res.body?.message).toMatch(/Invalid email|Password is required/);
    });

    it('rejects mismatched passwords', async () => {
      const res = await request(app)
        .post('/api/user/sign-up')
        .send({ email: 'a@ku.th', password: 'abcdefgh', confirm_password: 'abcdefghi', role: 'Student' });
      expect(res.status).toBe(400);
      expect(res.body?.message).toMatch(/Passwords do not match/);
    });

    it('accepts minimal valid payload and returns 201', async () => {
      const spy = jest.spyOn(UserService.prototype, 'sign_up').mockResolvedValue({ id: 123 } as any);
      const res = await request(app)
        .post('/api/user/sign-up')
        .send({ email: `v-${Date.now()}@ku.th`, password: 'abcdefgh', confirm_password: 'abcdefgh', role: 'Student' });
      expect(res.status).toBe(201);
      expect(res.body?.data?.id).toBe(123);
      spy.mockRestore();
    });

    it('rejects invalid password length (too short or too long)', async () => {
      // too short
      let res = await request(app)
        .post('/api/user/sign-up')
        .send({ email: 'a@ku.th', password: 'short', confirm_password: 'short', role: 'Student' });
      expect(res.status).toBe(400);
      expect(res.body?.message).toMatch(/Password must be 8-15 characters long/);

      // too long (16 chars)
      res = await request(app)
        .post('/api/user/sign-up')
        .send({ email: 'a@ku.th', password: 'a'.repeat(16), confirm_password: 'a'.repeat(16), role: 'Student' });
      expect(res.status).toBe(400);
      expect(res.body?.message).toMatch(/Password must be 8-15 characters long/);
    });
  });

  describe('login', () => {
    it('rejects missing user_name', async () => {
      const res = await request(app)
        .post('/api/user/login')
        .send({ password: 'p' });
      expect(res.status).toBe(400);
      expect(res.body?.message).toMatch(/Missing or invalid username/);
    });

    it('rejects missing password', async () => {
      const spy = jest.spyOn(UserService.prototype, 'login').mockImplementation(() => { throw new Error('login should not be called'); });
      const res = await request(app)
        .post('/api/user/login')
        .send({ user_name: 'u' });
      expect(res.status).toBe(400);
      expect(res.body?.message).toMatch(/Missing or invalid password|login should not be called|Missing username or password|Invalid value/);
      spy.mockRestore();
    });

    it('accepts valid minimal payload', async () => {
      const spy = jest.spyOn(UserService.prototype, 'login').mockResolvedValue({ access_token: 'a', refresh_token: 'r' } as any);
      const res = await request(app)
        .post('/api/user/login')
        .send({ user_name: 'u', password: 'p' });
      expect(res.status).toBe(200);
      spy.mockRestore();
    });
  });
});
