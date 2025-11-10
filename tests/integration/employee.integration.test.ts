import { PrismaClient, JobType, WorkPlace } from '@prisma/client';
import { EmployeeRepository } from '../../repository/employeeRepository.js';
import { UserRepository } from '../../repository/userRepository.js';
import { CompanyRepository } from '../../repository/companyRepository.js';
import { Role } from '../../utils/enums.js';

const hasDb = !!process.env.DOCKER_DATABASE_URL;
const prisma = hasDb ? new PrismaClient() : (null as any);
const describeIf = hasDb ? describe : describe.skip;

describeIf('Integration: EmployeeRepository', () => {
  const repo = new EmployeeRepository();
  const userRepo = new UserRepository();
  const companyRepo = new CompanyRepository();

  const createdUserIds: number[] = [];
  const createdCompanyUserIds: number[] = [];

  beforeAll(async () => { await prisma.$connect(); });
  afterAll(async () => { await prisma.$disconnect(); });

  afterEach(async () => {
    for (const id of createdUserIds.splice(0)) {
      try { await prisma.user.delete({ where: { id } }); } catch {}
    }
    for (const id of createdCompanyUserIds.splice(0)) {
      try { await prisma.user.delete({ where: { id } }); } catch {}
    }
  });

  async function createStudentWithProfile() {
    const email = `itest-emp-${Date.now()}@ku.th`;
    const user = await userRepo.create_user({
      first_name: 'Emp', last_name: 'User', stdId: '66000001', company_name: null,
      user_name: `emp_${Date.now()}`, email, password_hash: null, role: Role.Student,
      verified: false, status: 'Pending', profile_image: null,
    } as any);
    createdUserIds.push(user.id);
    const profile = await prisma.employeeProfile.findUnique({ where: { user_id: user.id } });
    return { user, profile: profile! };
  }

  async function createCompanyWithJob() {
    const email = `itest-co-${Date.now()}@example.com`;
    const companyUser = await prisma.user.create({
      data: { email, role: 'Company', verified: true, status: 'Approved' }
    });
    createdCompanyUserIds.push(companyUser.id);
    const company = await prisma.companyProfile.create({ data: { user_id: companyUser.id, company_name: 'EmpCo' } });
    const job = await prisma.jobPost.create({
      data: { company_id: company.id, job_title: 'Engineer', description: 'Engineer', location: 'Bangkok', work_place: WorkPlace.OnSite, minimum_expected_salary: 15000, maximum_expected_salary: 30000, jobType: JobType.FullTime, position: 'Engineer', available_position: 3, status: 'Active' } as any
    });
    return { companyUser, company, job };
  }

  it('upload_resume/get_resumes/count/main/unset/delete', async () => {
    const { profile, user } = await createStudentWithProfile();

    await repo.upload_resume(profile.id, 's3://bucket/resume1.pdf', false);
    await repo.upload_resume(profile.id, 's3://bucket/resume2.pdf', true);

    const resumes = await repo.get_resumes(profile.id);
    expect(resumes.length).toBe(2);

    const count = await repo.resume_count(profile.id);
    expect(count).toBe(2);

    const main = await repo.find_main_resume(profile.id);
    expect(main?.file_url).toBe('s3://bucket/resume2.pdf');

    if (main) {
      await repo.unset_main_resume(main.id, profile.id);
      const afterUnset = await repo.find_main_resume(profile.id);
      expect(afterUnset).toBeNull();

  const firstResume = resumes[0]!;
  await repo.set_main_resume(firstResume.id, profile.id);
  const afterSet = await repo.find_main_resume(profile.id);
  expect(afterSet?.id).toBe(firstResume.id);

  const secondResume = resumes[1]!;
  await repo.delete_resume_by_id(secondResume.id, profile.id);
      const afterDeleteList = await repo.get_resumes(profile.id);
      expect(afterDeleteList.length).toBe(1);
    }
  });

  it('list_own_resume returns resumes for owner', async () => {
    const { profile, user } = await createStudentWithProfile();
    await repo.upload_resume(profile.id, 's3://bucket/resume1.pdf', false);

    const items = await repo.list_own_resume(user.id);
    expect(items.length).toBeGreaterThan(0);
  });

  it('apply_to_individual_job and cancel_application lifecycle', async () => {
    const { profile, user } = await createStudentWithProfile();
    await repo.upload_resume(profile.id, 's3://bucket/resume1.pdf', true);
  const resume = (await repo.get_resumes(profile.id))[0]!;

    const { company, job } = await createCompanyWithJob();

    const application = await repo.apply_to_individual_job(job.id, user.id, resume.id);
    expect(application.job_id).toBe(job.id);

    const canceled = await repo.cancel_application(user.id, application.id);
    expect(canceled.id).toBe(application.id);
  });
});
