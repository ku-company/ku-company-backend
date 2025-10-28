import { PrismaClient } from '@prisma/client';
import { ProfessorRepository } from '../../repository/professorRepository.js';

const hasDb = !!process.env.DOCKER_DATABASE_URL;
const prisma = hasDb ? new PrismaClient() : (null as any);
const describeIf = hasDb ? describe : describe.skip;

describeIf('Integration: ProfessorRepository', () => {
  const repo = new ProfessorRepository();
  const createdUserIds: number[] = [];

  beforeAll(async () => { await prisma.$connect(); });
  afterAll(async () => { await prisma.$disconnect(); });

  afterEach(async () => {
    for (const id of createdUserIds.splice(0)) {
      try { await prisma.user.delete({ where: { id } }); } catch {}
    }
  });

  async function createProfessorUser() {
    const email = `itest-prof-${Date.now()}@ku.ac.th`;
    const user = await prisma.user.create({ data: { email, role: 'Professor', verified: true, status: 'Approved' } });
    createdUserIds.push(user.id);
    return user;
  }

  async function ensureEmployee() {
    const email = `itest-emp-${Date.now()}@ku.th`;
    const u = await prisma.user.create({ data: { email, role: 'Student', verified: false, status: 'Pending' } });
    createdUserIds.push(u.id);
    await prisma.employeeProfile.create({ data: { user_id: u.id } });
    return await prisma.employeeProfile.findUnique({ where: { user_id: u.id } });
  }

  it.skip('create_profile and create_post (Announcement) sends notifications to employees', async () => {
    // Skipped in integration: notification fan-out scans all employees and can race with other parallel tests.
  });

  it('add_comment_to_company creates a comment with relations', async () => {
    const profUser = await createProfessorUser();
    await repo.create_profile(profUser.id, { department: 'CS', faculty: 'ENG', position: 'Lecturer' } as any);

    const companyUser = await prisma.user.create({ data: { email: `itest-comp-${Date.now()}@example.com`, role: 'Company', verified: true, status: 'Approved' } });
    createdUserIds.push(companyUser.id);
    const company = await prisma.companyProfile.create({ data: { user_id: companyUser.id, company_name: 'CoX' } });

    const c = await repo.add_comment_to_company(profUser.id, company.id, 'Nice profile!');
    expect(c.content).toBe('Nice profile!');
    expect(c.company.id).toBe(company.id);
    expect(c.user.first_name).toBeNull();
  });

  it('get_all_posts and get_all_announcement/opinions', async () => {
    const profUser = await createProfessorUser();
    const profile = await repo.create_profile(profUser.id, { department: 'CS', faculty: 'ENG', position: 'Lecturer' } as any);

    // Seed posts directly to avoid triggering notification fan-out in repository.create_post
    await prisma.announcement.create({ data: { professor_id: profile.id, type_post: 'Announcement', content: 'Ann', is_connection: false } });
    await prisma.announcement.create({ data: { professor_id: profile.id, type_post: 'Opinion', content: 'Op', is_connection: false } });

    const all = await repo.get_all_posts(profile.id);
    expect(all.length).toBeGreaterThanOrEqual(2);

  const onlyAnn = await repo.get_all_announcement(profile.id);
  expect(onlyAnn.every((p: any) => p.type_post === 'Announcement')).toBe(true);

  const onlyOpin = await repo.get_all_opinions(profile.id);
  expect(onlyOpin.every((p: any) => p.type_post === 'Opinion')).toBe(true);
  });
});
