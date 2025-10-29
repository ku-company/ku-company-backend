import { PrismaClient, JobType } from '@prisma/client';
import { JobPostingPublicRepository } from '../../repository/jobPostingRepository.js';

const hasDb = !!process.env.DOCKER_DATABASE_URL;

const prisma = hasDb ? new PrismaClient() : (null as any);

const describeIf = hasDb ? describe : describe.skip;

describeIf('Integration: JobPostingPublicRepository', () => {
  const repo = new JobPostingPublicRepository();

  // Note: generate unique email per test run to avoid cross-run collisions
  // (the database persists between runs)

  let userId: number | null = null;
  let companyId: number | null = null;
  let jobId1: number | null = null;
  let jobId2: number | null = null;

  beforeAll(async () => {
    // Ensure Prisma can connect
    await prisma.$connect();
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.$disconnect();
    }
  });

  beforeEach(async () => {
    // Create a fresh company and two job posts
    const uniqueEmail = `itest-company-${Date.now()}-${Math.random()}@example.com`;
    const user = await prisma.user.create({
      data: {
        email: uniqueEmail,
        role: 'Company',
        verified: true,
        status: 'Approved',
      },
    });
    userId = user.id;
    const company = await prisma.companyProfile.create({
      data: {
        user_id: user.id,
        company_name: 'ITEST-Co',
        location: 'Bangkok',
        tel: '000',
      },
    });
    companyId = company.id;

    const job1 = await prisma.jobPost.create({
      data: {
        company_id: company.id,
        job_title: 'ITEST: Backend developer',
        description: 'ITEST: Backend developer position',
        jobType: JobType.FullTime,
        position: 'Developer',
        available_position: 2,
        status: 'Active',
      },
    });
    jobId1 = job1.id;
    const job2 = await prisma.jobPost.create({
      data: {
        company_id: company.id,
        job_title: 'ITEST: Closed position',
        description: 'ITEST: Closed position',
        jobType: JobType.Internship,
        position: 'Designer',
        available_position: 0,
        status: 'Closed',
      },
    });
    jobId2 = job2.id;
  });

  afterEach(async () => {
    // Clean up created data by deleting the user (cascades to company/job posts)
    if (userId) {
      try {
        await prisma.user.delete({ where: { id: userId } });
      } catch (e) {
        // ignore if already removed
      }
    }
    userId = companyId = jobId1 = jobId2 = null;
  });

  it('get_all_job_postings filters by available_position > 0 and includes company', async () => {
    const items = await repo.get_all_job_postings();
    // Should include jobId1 and exclude jobId2
    const ids = items.map((i) => i.id);
    expect(ids).toContain(jobId1!);
    expect(ids).not.toContain(jobId2!);

    const first = items.find((i) => i.id === jobId1)!;
    expect(first.company).toBeDefined();
    expect(first.company.company_name).toBe('ITEST-Co');
  });

  it('get_all_job_postings applies keyword OR filter (description/location/company_name)', async () => {
    // keyword that matches location
    const byLocation = await repo.get_all_job_postings('bang');
    expect(byLocation.some((j) => j.id === jobId1)).toBe(true);

    // keyword that matches description
    const byDesc = await repo.get_all_job_postings('backend');
    expect(byDesc.some((j) => j.id === jobId1)).toBe(true);

    // keyword that matches company_name
    const byCompany = await repo.get_all_job_postings('itest');
    expect(byCompany.some((j) => j.id === jobId1)).toBe(true);
  });

  it('get_job_posting_by_id returns item with company include', async () => {
    const item = await repo.get_job_posting_by_id(jobId1!);
    expect(item).toBeTruthy();
    expect(item!.company.company_name).toBe('ITEST-Co');
  });
});

// Provide a helpful message when DB is not configured
describeIf('Integration: Environment check', () => {
  it('has DOCKER_DATABASE_URL set', () => {
    expect(process.env.DOCKER_DATABASE_URL).toBeDefined();
  });
});