import request from './_request.js';
import { buildTestApp } from './_app.js';

describe('Controller: Admin', () => {
  afterEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
  });

  it('PATCH /api/admin/verify-user/:id returns 200 when service verifies', async () => {
    jest.resetModules();
    jest.doMock('../../service/adminService.js', () => {
      return {
        AdminService: class {
          async verify_user(id: number) { return { id, verified: true }; }
        }
      };
    });

    const { default: adminRoutes } = await import('../../router/adminRoutes.js');
    const app = buildTestApp((a) => a.use('/api/admin', adminRoutes));

    const res = await request(app)
      .patch('/api/admin/verify-user/5')
      .set('x-role', 'Admin')
      .set('x-user-id', '1');

    expect(res.status).toBe(200);
    expect(res.body?.data?.verified).toBe(true);
  });
});
import adminRoutes from '../../router/adminRoutes.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Controller: Admin', () => {
  const app = buildTestApp((a) => {
    a.use('/api/admin', adminRoutes);
  });

  let adminId: number | null = null;
  let userId: number | null = null;

  beforeAll(async () => { await prisma.$connect(); });
  afterAll(async () => { await prisma.$disconnect(); });
  afterEach(async () => { 
    if (userId) { try { await prisma.user.delete({ where: { id: userId } }); } catch {} userId = null; }
    if (adminId) { try { await prisma.user.delete({ where: { id: adminId } }); } catch {} adminId = null; }
  });

  it('GET /api/admin/list-all-user returns list (role Admin)', async () => {
    const admin = await prisma.user.create({ data: { email: `admin-${Date.now()}@test.com`, role: 'Admin', verified: true, status: 'Approved' } });
    adminId = admin.id;
    const u = await prisma.user.create({ data: { email: `user-${Date.now()}@test.com`, role: 'Student', verified: false, status: 'Pending' } });
    userId = u.id;

    const res = await request(app)
      .get('/api/admin/list-all-user')
      .set('x-user-id', String(admin.id))
      .set('x-role', 'Admin')
      .set('x-verified', 'true');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('POST /api/admin/add-user creates user (Admin)', async () => {
    const admin = await prisma.user.create({ data: { email: `admin-${Date.now()}@test.com`, role: 'Admin', verified: true, status: 'Approved' } });
    adminId = admin.id;

    const res = await request(app)
      .post('/api/admin/add-user')
      .set('x-user-id', String(admin.id))
      .set('x-role', 'Admin')
      .send({ email: `stu-${Date.now()}@ku.th`, role: 'Student', stdId: '6600000000' });

    expect(res.status).toBe(200);
    expect(res.body?.data?.id).toBeDefined();
    // cleanup created user
    if (res.body?.data?.id) { try { await prisma.user.delete({ where: { id: res.body.data.id } }); } catch {} }
  });

  it('PATCH /api/admin/verify-user/:id marks user verified', async () => {
    const admin = await prisma.user.create({ data: { email: `admin-${Date.now()}@test.com`, role: 'Admin', verified: true, status: 'Approved' } });
    adminId = admin.id;
    const u = await prisma.user.create({ data: { email: `user-${Date.now()}@test.com`, role: 'Student', verified: false, status: 'Pending' } });
    userId = u.id;

    const res = await request(app)
      .patch(`/api/admin/verify-user/${u.id}`)
      .set('x-user-id', String(admin.id))
      .set('x-role', 'Admin');

    expect(res.status).toBe(200);
    expect(res.body?.data?.verified).toBe(true);
  });

  it('PATCH /api/admin/reject-user/:id marks user rejected', async () => {
    const admin = await prisma.user.create({ data: { email: `admin-${Date.now()}@test.com`, role: 'Admin', verified: true, status: 'Approved' } });
    adminId = admin.id;
    const u = await prisma.user.create({ data: { email: `user-${Date.now()}@test.com`, role: 'Student', verified: false, status: 'Pending' } });
    userId = u.id;

    const res = await request(app)
      .patch(`/api/admin/reject-user/${u.id}`)
      .set('x-user-id', String(admin.id))
      .set('x-role', 'Admin');

    expect(res.status).toBe(200);
    expect(res.body?.data?.status).toBe('Rejected');
  });

  it('PATCH /api/admin/edit-user/:id updates user fields', async () => {
    const admin = await prisma.user.create({ data: { email: `admin-${Date.now()}@test.com`, role: 'Admin', verified: true, status: 'Approved' } });
    adminId = admin.id;
    const u = await prisma.user.create({ data: { email: `user-${Date.now()}@test.com`, role: 'Student', verified: false, status: 'Pending' } });
    userId = u.id;

    const res = await request(app)
      .patch(`/api/admin/edit-user/${u.id}`)
      .set('x-user-id', String(admin.id))
      .set('x-role', 'Admin')
      .send({ first_name: 'Bob' });

    expect(res.status).toBe(200);
    expect(res.body?.data?.first_name).toBe('Bob');
  });

  it('DELETE /api/admin/delete-user/:id deletes user', async () => {
    const admin = await prisma.user.create({ data: { email: `admin-${Date.now()}@test.com`, role: 'Admin', verified: true, status: 'Approved' } });
    adminId = admin.id;
    const u = await prisma.user.create({ data: { email: `user-${Date.now()}@test.com`, role: 'Student', verified: false, status: 'Pending' } });
    const uid = u.id;
    userId = uid;

    const res = await request(app)
      .delete(`/api/admin/delete-user/${uid}`)
      .set('x-user-id', String(admin.id))
      .set('x-role', 'Admin');

    expect(res.status).toBe(200);
    // verify deletion
    const exists = await prisma.user.findUnique({ where: { id: uid } });
    expect(exists).toBeNull();
    userId = null;
  });

  it('GET /api/admin/filtering-user filters by status', async () => {
    const admin = await prisma.user.create({ data: { email: `admin-${Date.now()}@test.com`, role: 'Admin', verified: true, status: 'Approved' } });
    adminId = admin.id;
    const u = await prisma.user.create({ data: { email: `user-${Date.now()}@test.com`, role: 'Student', verified: false, status: 'Pending' } });
    userId = u.id;

    const res = await request(app)
      .get(`/api/admin/filtering-user?status=Pending`)
      .set('x-user-id', String(admin.id))
      .set('x-role', 'Admin');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body?.data)).toBe(true);
  });
});
