import request from './_request.js';
import { buildTestApp } from './_app.js';
import jobPostingPublicRoutes from '../../router/jobPostingPublicRoutes.js';
import { PrismaClient, JobType } from '@prisma/client';

const prisma = new PrismaClient();

describe('Controller: JobPostingPublic', () => {
  const app = buildTestApp((a) => {
    a.use('/api/job-postings', jobPostingPublicRoutes);
  });

  let userId: number | null = null;
  let companyId: number | null = null;
  let jobId: number | null = null;

  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    const user = await prisma.user.create({ data: { email: `c-${Date.now()}@test.com`, role: 'Company', verified: true, status: 'Approved' } });
    userId = user.id;
    const company = await prisma.companyProfile.create({ data: { user_id: user.id, company_name: 'CtrlCo' } });
    companyId = company.id;
    const job = await prisma.jobPost.create({ data: { company_id: company.id, description: 'Controller Test', jobType: JobType.FullTime, position: 'Dev', available_position: 1, status: 'Active' } });
    jobId = job.id;
  });

  afterEach(async () => {
    if (userId) {
      try { await prisma.user.delete({ where: { id: userId } }); } catch {}
    }
    userId = companyId = jobId = null;
  });

  it('GET /api/job-postings returns list', async () => {
    const res = await request(app).get('/api/job-postings');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.job_postings)).toBe(true);
    expect(res.body.job_postings.some((j: any) => j.id === jobId)).toBe(true);
  });

  it('GET /api/job-postings/:id returns item', async () => {
    const res = await request(app).get(`/api/job-postings/${jobId}`);
    expect(res.status).toBe(200);
    expect(res.body.job_posting.id).toBe(jobId);
  });

  it('GET /api/job-postings/category returns categories', async () => {
    const res = await request(app).get('/api/job-postings/category');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.categories)).toBe(true);
  });

  it('GET /api/job-postings/job-type returns jobTypes', async () => {
    const res = await request(app).get('/api/job-postings/job-type');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.jobTypes)).toBe(true);
  });
});
