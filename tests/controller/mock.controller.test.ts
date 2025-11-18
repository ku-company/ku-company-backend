import request from './_request.js';
import { buildTestApp } from './_app.js';
import mockRoutes from '../../router/mockRoutes.js';

describe('Controller: Mock', () => {
  const app = buildTestApp((a) => {
    a.use('/api/mock', mockRoutes);
  });

  it('GET /api/mock/findjob returns a list', async () => {
    const res = await request(app)
      .get('/api/mock/findjob');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('GET /api/mock/admin requires Admin role', async () => {
    const res = await request(app)
      .get('/api/mock/admin')
      .set('x-role', 'Admin');
    expect(res.status).toBe(200);
    expect(res.body?.message).toMatch(/Admin Route/);
  });

  it('GET /api/mock/student allows Student role', async () => {
    const res = await request(app)
      .get('/api/mock/student')
      .set('x-role', 'Student');
    expect(res.status).toBe(200);
    expect(res.body?.message).toMatch(/Student or Company Route/);
  });

  it('GET /api/mock/company requires Company role', async () => {
    const res = await request(app)
      .get('/api/mock/company')
      .set('x-role', 'Company');
    expect(res.status).toBe(200);
    expect(res.body?.message).toMatch(/Company Route/);
  });

  it('GET /api/mock/professor requires Professor role', async () => {
    const res = await request(app)
      .get('/api/mock/professor')
      .set('x-role', 'Professor');
    expect(res.status).toBe(200);
    expect(res.body?.message).toMatch(/Professor Route/);
  });
});
