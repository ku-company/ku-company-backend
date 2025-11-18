import request from './_request.js';
import { buildTestApp } from './_app.js';

describe('Controller: Company', () => {
  afterEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
  });

  it('POST /api/company/profile returns 201 when service creates profile', async () => {
    jest.resetModules();
    jest.doMock('../../service/companyService.js', () => ({
      CompanyService: class { async create_profile(input: any) { return { id: 7, ...input }; } }
    }));

    const { default: profileRoutes } = await import('../../router/company/profileRoutes.js');
    const app = buildTestApp((a) => a.use('/api/company/profile', profileRoutes));

    const res = await request(app)
      .post('/api/company/profile')
      .set('x-user-id', '3')
      .set('x-role', 'Company')
      .send({ company_name: 'C' });

    expect(res.status).toBe(201);
    expect(res.body?.data?.id).toBe(7);
  });

  it('GET /api/company/profile returns 404 when not found', async () => {
    jest.resetModules();
    jest.doMock('../../service/companyService.js', () => ({ CompanyService: class { async get_profile(id: number) { return null; } } }));

    const { default: profileRoutes } = await import('../../router/company/profileRoutes.js');
    const app = buildTestApp((a) => a.use('/api/company/profile', profileRoutes));

    const res = await request(app)
      .get('/api/company/profile')
      .set('x-user-id', '3')
      .set('x-role', 'Company');

    expect(res.status).toBe(404);
  });

  it('POST /api/company/job-postings creates job posting', async () => {
    jest.resetModules();
    jest.doMock('../../service/companyService.js', () => ({ CompanyService: class { async create_job_posting(u: number, input: any) { return { id: 11, ...input }; } } }));

    const { default: jobRoutes } = await import('../../router/company/jobPostingRoutes.js');
    const app = buildTestApp((a) => a.use('/api/company/job-postings', jobRoutes));

    const res = await request(app)
      .post('/api/company/job-postings')
      .set('x-user-id', '4')
      .set('x-role', 'Company')
      .send({ job_title: 'Dev' });

    expect(res.status).toBe(201);
    expect(res.body?.data?.id).toBe(11);
  });
});
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

  it('POST/PATCH /api/company/profile/image without file returns 400', async () => {
    const postRes = await request(app)
      .post('/api/company/profile/image')
      .set('x-user-id', '1')
      .set('x-role', 'Company');
    expect(postRes.status).toBe(400);

    const patchRes = await request(app)
      .patch('/api/company/profile/image')
      .set('x-user-id', '1')
      .set('x-role', 'Company');
    expect(patchRes.status).toBe(400);
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
