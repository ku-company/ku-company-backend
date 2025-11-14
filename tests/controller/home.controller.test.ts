import { PrismaClient } from '@prisma/client';
import request from './_request.js';
import { buildTestApp } from './_app.js';
import homeRoutes from '../../router/homeRoutes.js';

const prisma = new PrismaClient();
const hasDb = !!process.env.DOCKER_DATABASE_URL;
const describeIf = hasDb ? describe : describe.skip;

describeIf('Controller: HomePublic', () => {
  const app = buildTestApp(a => {
    a.use('/api/home', homeRoutes);
  });

  let userId1: number | null = null;
  let userId2: number | null = null;
  let companyId1: number | null = null;
  let companyId2: number | null = null;
  let jobIds: number[] = [];

  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Two companies with different job post counts
    const u1 = await prisma.user.create({ data: { email: `home1-${Date.now()}@example.com`, role: 'Company', verified: true, status: 'Approved' } });
    const u2 = await prisma.user.create({ data: { email: `home2-${Date.now()}@example.com`, role: 'Company', verified: true, status: 'Approved' } });
    userId1 = u1.id; userId2 = u2.id;
    const c1 = await prisma.companyProfile.create({ data: { user_id: u1.id, company_name: 'AlphaCo' } });
    const c2 = await prisma.companyProfile.create({ data: { user_id: u2.id, company_name: 'BetaCo' } });
    companyId1 = c1.id; companyId2 = c2.id;
    // AlphaCo has 2 posts, BetaCo has 1 post
    const jp1 = await prisma.jobPost.create({ data: { company_id: c1.id, job_title: 'A1', description: 'A1', location: 'Loc', work_place: 'OnSite', minimum_expected_salary: 1, maximum_expected_salary: 2, jobType: 'FullTime', position: 'Dev', available_position: 1 } as any });
    const jp2 = await prisma.jobPost.create({ data: { company_id: c1.id, job_title: 'A2', description: 'A2', location: 'Loc', work_place: 'OnSite', minimum_expected_salary: 1, maximum_expected_salary: 2, jobType: 'FullTime', position: 'Dev', available_position: 1 } as any });
    const jp3 = await prisma.jobPost.create({ data: { company_id: c2.id, job_title: 'B1', description: 'B1', location: 'Loc', work_place: 'OnSite', minimum_expected_salary: 1, maximum_expected_salary: 2, jobType: 'FullTime', position: 'Dev', available_position: 1 } as any });
    jobIds = [jp1.id, jp2.id, jp3.id];
    // Make one older by updating created_at back 2 days for A2
    await prisma.jobPost.update({ where: { id: jp2.id }, data: { created_at: new Date(Date.now() - 2*86400000) } });
  });

  afterEach(async () => {
    // cascade delete by removing users
    for (const uid of [userId1, userId2]) {
      if (uid) {
        try { await prisma.user.delete({ where: { id: uid } }); } catch {}
      }
    }
    userId1 = userId2 = companyId1 = companyId2 = null; jobIds = [];
  });

  it('GET /api/home/top-companies returns ordered list with _count.jobPosts', async () => {
    const res = await request(app).get('/api/home/top-companies');
    expect(res.status).toBe(200);
    const list = res.body.top_companies;
    expect(Array.isArray(list)).toBe(true);
    // AlphaCo should appear before BetaCo due to higher count
    const names = list.map((c: any) => c.company_name);
    const alphaIndex = names.indexOf('AlphaCo');
    const betaIndex = names.indexOf('BetaCo');
    expect(alphaIndex).toBeGreaterThanOrEqual(0);
    expect(betaIndex).toBeGreaterThanOrEqual(0);
    expect(alphaIndex).toBeLessThan(betaIndex);
    expect(list.find((c: any) => c.company_name === 'AlphaCo')._count.jobPosts).toBe(2);
  });

  it('GET /api/home/top-job-postings returns 3 posts with posted_ago field', async () => {
    const res = await request(app).get('/api/home/top-job-postings');
    expect(res.status).toBe(200);
    const posts = res.body.top_job_postings;
    expect(Array.isArray(posts)).toBe(true);
    expect(posts.length).toBeLessThanOrEqual(3);
    // Ensure posted_ago present
    expect(posts.every((p: any) => typeof p.posted_ago === 'string')).toBe(true);
  });
});
