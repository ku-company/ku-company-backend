import request from '../controller/_request.js';
import { buildTestApp } from '../controller/_app.js';
import userRoutes from '../../router/userRoutes.js';

describe('Security: Auth rate limiting', () => {
  const app = buildTestApp((a) => {
    a.use('/api/user', userRoutes);
  });

  test('exceeds login attempts returns 429', async () => {
    // 11 attempts (limit is 10 in minute window)
    for (let i = 0; i < 10; i++) {
      await request(app)
        .post('/api/user/login')
        .send({ user_name: 'nonexistent', password: 'bad' });
    }
    const res = await request(app)
      .post('/api/user/login')
      .send({ user_name: 'nonexistent', password: 'bad' });
    expect(res.status).toBe(429);
    expect(res.body.message).toMatch(/too many requests/i);
    expect(res.headers['retry-after']).toBeDefined();
  });

  test('exceeds refresh-token attempts returns 429', async () => {
    for (let i = 0; i < 10; i++) {
      await request(app)
        .post('/api/user/refresh-token')
        .send({ refresh_token: 'invalid' });
    }
    const res = await request(app)
      .post('/api/user/refresh-token')
      .send({ refresh_token: 'invalid' });
    expect(res.status).toBe(429);
    expect(res.body.message).toMatch(/too many requests/i);
  });
});
