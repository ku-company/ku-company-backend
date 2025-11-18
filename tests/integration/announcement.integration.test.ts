import { PrismaClient, JobType, WorkPlace } from '@prisma/client';
import { AnnouncementRepository } from '../../repository/announcementRepository.js';

const hasDb = !!process.env.DOCKER_DATABASE_URL;
const prisma = hasDb ? new PrismaClient() : (null as any);
const describeIf = hasDb ? describe : describe.skip;

describeIf('Integration: AnnouncementRepository', () => {
  const repo = new AnnouncementRepository();
  const createdUserIds: number[] = [];

  beforeAll(async () => { await prisma.$connect(); });
  afterAll(async () => { await prisma.$disconnect(); });

  afterEach(async () => {
    for (const id of createdUserIds.splice(0)) {
      try { await prisma.user.delete({ where: { id } }); } catch {}
    }
  });

  it('get_post_by_id and get_all_posts include job_post and order desc', async () => {
    const profUser = await prisma.user.create({ data: { email: `itest-ann-${Date.now()}@ku.ac.th`, role: 'Professor', verified: true, status: 'Approved' } });
    createdUserIds.push(profUser.id);
    const prof = await prisma.professorProfile.create({ data: { user_id: profUser.id, department: 'CS', faculty: 'ENG' } });

    const companyUser = await prisma.user.create({ data: { email: `itest-ann-co-${Date.now()}@example.com`, role: 'Company', verified: true, status: 'Approved' } });
    createdUserIds.push(companyUser.id);
    const company = await prisma.companyProfile.create({ data: { user_id: companyUser.id, company_name: 'ABC' } });
  const job = await prisma.jobPost.create({ data: { company_id: company.id, job_title: 'JD', description: 'JD', location: 'Bangkok', work_place: WorkPlace.OnSite, minimum_expected_salary: 12000, maximum_expected_salary: 24000, jobType: JobType.FullTime, position: 'Dev', available_position: 1 } as any });
  // Clean up any existing announcements to ensure a clean test slate.
  await prisma.announcement.deleteMany();

  // Ensure deterministic ordering by setting explicit created_at timestamps
  const t1 = new Date();
  const t2 = new Date(t1.getTime() + 1000);
  const a1 = await prisma.announcement.create({ data: { professor_id: prof.id, type_post: 'Opinion', content: 'Op', created_at: t1 } });
  const a2 = await prisma.announcement.create({ data: { professor_id: prof.id, type_post: 'Repost', job_id: job.id, is_connection: true, created_at: t2 } });

    const byId = await repo.get_post_by_id(a2.id);
    expect(byId?.job_post?.id).toBe(job.id);

    const all = await repo.get_all_posts();
    expect(all.length).toBeGreaterThanOrEqual(2);
    // ordered desc by created_at, so last created (a2) should appear before a1
    const ids = all.map((x: any) => x.id);
    expect(ids.indexOf(a2.id)).toBeLessThan(ids.indexOf(a1.id));
  });
});
