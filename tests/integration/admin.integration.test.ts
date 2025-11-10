import { PrismaClient } from '@prisma/client';
import { AdminRepository } from '../../repository/adminRepository.js';

const hasDb = !!process.env.DOCKER_DATABASE_URL;
const prisma = hasDb ? new PrismaClient() : (null as any);
const describeIf = hasDb ? describe : describe.skip;

describeIf('Integration: AdminRepository', () => {
  const repo = new AdminRepository();
  const createdUserIds: number[] = [];

  beforeAll(async () => { await prisma.$connect(); });
  afterAll(async () => { await prisma.$disconnect(); });

  afterEach(async () => {
    for (const id of createdUserIds.splice(0)) {
      try { await prisma.user.delete({ where: { id } }); } catch {}
    }
  });

  it('add_user creates a pending user', async () => {
    const email = `itest-admin-add-${Date.now()}@example.com`;
    const user = await repo.add_user({
      first_name: 'Adm', last_name: 'In', stdId: null, company_name: null, user_name: `adm_${Date.now()}`,
      email, password_hash: null, role: 'Admin', verified: false, status: 'Pending', profile_image: null
    } as any);
    createdUserIds.push(user.id);
    expect(user.status).toBe('Pending');
  });

  it('verify_user sets verified true and status Approved', async () => {
    const u = await prisma.user.create({ data: { email: `itest-verify-${Date.now()}@example.com`, role: 'Company', verified: false, status: 'Pending' } });
    createdUserIds.push(u.id);
    const updated = await repo.verify_user(u.id);
    expect(updated.verified).toBe(true);
    expect(updated.status).toBe('Approved');
  });

  it('reject_user sets verified false and status Rejected', async () => {
    const u = await prisma.user.create({ data: { email: `itest-reject-${Date.now()}@example.com`, role: 'Company', verified: false, status: 'Pending' } });
    createdUserIds.push(u.id);
    const updated = await repo.reject_user(u.id);
    expect(updated.verified).toBe(false);
    expect(updated.status).toBe('Rejected');
  });

  it('edit_user updates basic fields', async () => {
    const u = await prisma.user.create({ data: { email: `itest-edit-${Date.now()}@example.com`, role: 'Company', verified: false, status: 'Pending', first_name: 'A', last_name: 'B' } });
    createdUserIds.push(u.id);
    const updated = await repo.edit_user(u.id, { ...u, first_name: 'A1', last_name: 'B1', role: 'Company', verified: false, status: 'Pending' } as any);
    expect(updated.first_name).toBe('A1');
    expect(updated.last_name).toBe('B1');
  });

  it('list_user and list_filtering_user return minimal fields', async () => {
    const u1 = await prisma.user.create({ data: { email: `itest-list1-${Date.now()}@example.com`, role: 'Company', verified: false, status: 'Pending', user_name: `u_${Date.now()}` } });
    const u2 = await prisma.user.create({ data: { email: `itest-list2-${Date.now()}@example.com`, role: 'Company', verified: false, status: 'Rejected', user_name: `u_${Date.now()+1}` } });
    createdUserIds.push(u1.id, u2.id);

    const all = await repo.list_user();
    expect(all.some((x: any) => x.user_name === u1.user_name)).toBe(true);

    const rejected = await repo.list_filtering_user('Rejected' as any);
    expect(rejected.every((x: any) => x.status === 'Rejected')).toBe(true);
  });

  it('find_user_by_id returns selected fields and delete_user removes user', async () => {
    const u = await prisma.user.create({ data: { email: `itest-find-${Date.now()}@example.com`, role: 'Company', verified: false, status: 'Pending', user_name: `u_${Date.now()}` } });
    createdUserIds.push(u.id);

    const minimal = await repo.find_user_by_id(u.id);
    expect(minimal?.email).toBe(u.email);

    const deleted = await repo.delete_user(u.id);
    expect(deleted.id).toBe(u.id);

    // remove from cleanup since already deleted
    createdUserIds.pop();
  });
});
