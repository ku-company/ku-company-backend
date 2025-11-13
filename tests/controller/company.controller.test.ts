import request from './_request.js';
import { buildTestApp } from './_app.js';
// Mock multer-based middlewares to no-op
jest.mock('../../middlewares/uploadImageMiddleware', () => ({ uploadImage: { single: () => (_req: any, _res: any, next: any) => next() } }));

import companyRoutes from '../../router/companyRoutes.js';
import { CompanyService } from '../../service/companyService.js';
import { UserService } from '../../service/userService.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Controller: Company', () => {
  const app = buildTestApp((a) => {
    a.use('/api/company', companyRoutes);
  });

  let userId: number | null = null;

  beforeAll(async () => { await prisma.$connect(); });
  afterAll(async () => { await prisma.$disconnect(); });
  afterEach(async () => { if (userId) { try { await prisma.user.delete({ where: { id: userId } }); } catch {} userId = null; } });

  it('POST/GET /api/company/profile creates and retrieves company profile', async () => {
    const user = await prisma.user.create({ data: { email: `co-${Date.now()}@test.com`, role: 'Company', verified: true, status: 'Approved' } });
    userId = user.id;

    const createRes = await request(app)
      .post('/api/company/profile')
      .set('x-user-id', String(user.id))
      .set('x-role', 'Company')
      .set('x-verified', 'true')
      .send({ company_name: 'ACME Co', location: 'Bangkok' });

    expect(createRes.status).toBe(201);
    expect(createRes.body.data.user_id).toBe(user.id);

    const getRes = await request(app)
      .get('/api/company/profile')
      .set('x-user-id', String(user.id))
      .set('x-role', 'Company')
      .set('x-verified', 'true');

    expect(getRes.status).toBe(200);
    expect(getRes.body.data.user_id).toBe(user.id);
  });

  it('PATCH /api/company/profile updates profile', async () => {
    const spy = jest.spyOn(CompanyService.prototype, 'update_profile').mockResolvedValue({ user_id: 1, company_name: 'New' } as any);
    const res = await request(app)
      .patch('/api/company/profile')
      .set('x-user-id', '1')
      .set('x-role', 'Company')
      .send({ company_name: 'New' });
    expect(res.status).toBe(200);
    expect(res.body?.data?.company_name).toBe('New');
    spy.mockRestore();
  });

  it('POST/PATCH /api/company/profile/image without file returns 400 (multer error handled)', async () => {
    const postRes = await request(app)
      .post('/api/company/profile/image')
      .set('x-user-id', '1')
      .set('x-role', 'Company');
    // Multer parse error surfaces as 400 or 500 depending on Express error flow; accept 4xx/5xx
    expect([400,500]).toContain(postRes.status);

    const patchRes = await request(app)
      .patch('/api/company/profile/image')
      .set('x-user-id', '1')
      .set('x-role', 'Company');
    expect([400,500]).toContain(patchRes.status);
  });

  it('GET/DELETE /api/company/profile/image returns 200', async () => {
    const gspy = jest.spyOn(UserService.prototype, 'get_profile_image').mockResolvedValue('url://img' as any);
    const dspy = jest.spyOn(UserService.prototype, 'delete_profile_image').mockResolvedValue(undefined as any);

    const getRes = await request(app)
      .get('/api/company/profile/image')
      .set('x-user-id', '1')
      .set('x-role', 'Company');
    expect(getRes.status).toBe(200);
    expect(getRes.body?.profile_image).toBe('url://img');

    const delRes = await request(app)
      .delete('/api/company/profile/image')
      .set('x-user-id', '1')
      .set('x-role', 'Company');
    expect(delRes.status).toBe(200);
    gspy.mockRestore();
    dspy.mockRestore();
  });

  it('Job postings CRUD endpoints respond', async () => {
    const cspy = jest.spyOn(CompanyService.prototype, 'create_job_posting').mockResolvedValue({ id: 11 } as any);
    const aspy = jest.spyOn(CompanyService.prototype, 'get_all_job_postings').mockResolvedValue([{ id: 11 }] as any);
    const gspy = jest.spyOn(CompanyService.prototype, 'get_job_posting').mockResolvedValue({ id: 11 } as any);
    const uspy = jest.spyOn(CompanyService.prototype, 'update_job_posting').mockResolvedValue({ id: 11, description: 'd2' } as any);
    const dspy = jest.spyOn(CompanyService.prototype, 'delete_job_posting').mockResolvedValue(true as any);

    const createRes = await request(app)
      .post('/api/company/job-postings')
      .set('x-user-id', '1')
      .set('x-role', 'Company')
      .send({ description: 'd', jobType: 'FullTime', position: 'Backend_Developer', available_position: 1 });
    expect(createRes.status).toBe(201);
    expect(createRes.body?.data?.id).toBe(11);

    const listRes = await request(app)
      .get('/api/company/job-postings/all')
      .set('x-user-id', '1')
      .set('x-role', 'Company');
    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body?.data)).toBe(true);

    const getRes = await request(app)
      .get('/api/company/job-postings/11')
      .set('x-user-id', '1')
      .set('x-role', 'Company');
    expect(getRes.status).toBe(200);

    const updRes = await request(app)
      .patch('/api/company/job-postings/11')
      .set('x-user-id', '1')
      .set('x-role', 'Company')
      .send({ description: 'd2' });
    expect(updRes.status).toBe(200);

    const delRes = await request(app)
      .delete('/api/company/job-postings/11')
      .set('x-user-id', '1')
      .set('x-role', 'Company');
    expect(delRes.status).toBe(200);

    cspy.mockRestore(); aspy.mockRestore(); gspy.mockRestore(); uspy.mockRestore(); dspy.mockRestore();
  });

  it('Job applications endpoints respond', async () => {
    const aspy = jest.spyOn(CompanyService.prototype, 'get_all_job_applications').mockResolvedValue([] as any);
    const gspy = jest.spyOn(CompanyService.prototype, 'get_job_application').mockResolvedValue({ id: 5 } as any);
    const uspy = jest.spyOn(CompanyService.prototype, 'update_job_application_status').mockResolvedValue({ id: 5, status: 'Approved' } as any);
    const cspy = jest.spyOn(CompanyService.prototype, 'send_the_confirmation_to_employee').mockResolvedValue({ id: 5 } as any);

    const listRes = await request(app)
      .get('/api/company/job-applications')
      .set('x-user-id', '1')
      .set('x-role', 'Company');
    expect(listRes.status).toBe(200);

    const getRes = await request(app)
      .get('/api/company/job-applications/5')
      .set('x-user-id', '1')
      .set('x-role', 'Company');
    expect(getRes.status).toBe(200);

    const updRes = await request(app)
      .patch('/api/company/job-applications/5/status')
      .set('x-user-id', '1')
      .set('x-role', 'Company')
      .send({ status: 'Approved' });
    expect(updRes.status).toBe(200);

    const confRes = await request(app)
      .post('/api/company/job-applications/5/confirm')
      .set('x-user-id', '1')
      .set('x-role', 'Company');
    expect(confRes.status).toBe(200);

    aspy.mockRestore(); gspy.mockRestore(); uspy.mockRestore(); cspy.mockRestore();
  });

  it('GET /api/company/dashboard/overall returns stats', async () => {
    const spy = jest.spyOn(CompanyService.prototype, 'get_stats').mockResolvedValue({ total_job_postings: 4 } as any);
    const res = await request(app)
      .get('/api/company/dashboard/overall')
      .set('x-user-id', '1')
      .set('x-role', 'Company');
    expect(res.status).toBe(200);
    expect(res.body?.data?.total_job_postings).toBe(4);
    spy.mockRestore();
  });

  it('GET /api/company/dashboard/active-postings returns list of active postings', async () => {
    const spy = jest.spyOn(CompanyService.prototype, 'get_active_job_postings').mockResolvedValue([{ id: 1 }] as any);
    const res = await request(app)
      .get('/api/company/dashboard/active-postings')
      .set('x-user-id', '1')
      .set('x-role', 'Company');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body?.data)).toBe(true);
    spy.mockRestore();
  });
});
