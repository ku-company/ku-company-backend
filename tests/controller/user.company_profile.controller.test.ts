import { PrismaClient } from '@prisma/client';
import request from './_request.js';
import { buildTestApp } from './_app.js';
import userRoutes from '../../router/userRoutes.js';

const prisma = new PrismaClient();
const hasDb = !!process.env.DOCKER_DATABASE_URL;
const describeIf = hasDb ? describe : describe.skip;

describeIf('Controller: User - company profile', () => {
  const app = buildTestApp(a => {
    a.use('/api/user', userRoutes);
  });

  let userId: number | null = null;
  let companyId: number | null = null;

  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    const u = await prisma.user.create({ data: { email: `cprof-${Date.now()}@example.com`, role: 'Company', verified: true, status: 'Approved' } });
    userId = u.id;
    const c = await prisma.companyProfile.create({ data: { user_id: u.id, company_name: 'CtrlCo' } });
    companyId = c.id;
  });

  afterEach(async () => {
    if (userId) {
      try { await prisma.user.delete({ where: { id: userId } }); } catch {}
    }
    userId = companyId = null;
  });

  it('GET /api/user/company-profile/:id returns profile when found', async () => {
    const res = await request(app).get(`/api/user/company-profile/${companyId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(companyId);
    expect(res.body.data.company_name).toBe('CtrlCo');
  });

  it('GET /api/user/company-profile/:id returns 400 when not found', async () => {
    const res = await request(app).get(`/api/user/company-profile/99999999`);
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Company profile not found/i);
  });
});
