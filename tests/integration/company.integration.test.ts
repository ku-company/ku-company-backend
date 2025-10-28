import { PrismaClient, JobType } from '@prisma/client';
import { CompanyRepository } from '../../repository/companyRepository.js';
import { UserRepository } from '../../repository/userRepository.js';
import { EmployeeRepository } from '../../repository/employeeRepository.js';
import { Role } from '../../utils/enums.js';

const hasDb = !!process.env.DOCKER_DATABASE_URL;
const prisma = hasDb ? new PrismaClient() : (null as any);
const describeIf = hasDb ? describe : describe.skip;

describeIf('Integration: CompanyRepository', () => {
  const repo = new CompanyRepository();
  const userRepo = new UserRepository();
  const employeeRepo = new EmployeeRepository();

  const createdUserIds: number[] = [];

  beforeAll(async () => { await prisma.$connect(); });
  afterAll(async () => { await prisma.$disconnect(); });

  afterEach(async () => {
    for (const id of createdUserIds.splice(0)) {
      try { await prisma.user.delete({ where: { id } }); } catch {}
    }
  });

  async function createCompanyUser() {
    const email = `itest-company-${Date.now()}@example.com`;
    const user = await prisma.user.create({ data: { email, role: 'Company', verified: true, status: 'Approved' } });
    createdUserIds.push(user.id);
    return user;
  }

  async function createStudentWithResume() {
    const email = `itest-stu-${Date.now()}@ku.th`;
    const u = await userRepo.create_user({ first_name: 'E', last_name: 'U', stdId: '66000002', company_name: null, user_name: `stu_${Date.now()}`, email, password_hash: null, role: Role.Student, verified: false, status: 'Pending', profile_image: null } as any);
    createdUserIds.push(u.id);
    const profile = await prisma.employeeProfile.findUnique({ where: { user_id: u.id } });
    await employeeRepo.upload_resume(profile!.id, 's3://bucket/resume.pdf', true);
    const resume = (await employeeRepo.get_resumes(profile!.id))[0]!;
    return { user: u, profile: profile!, resume };
  }

  it('company profile CRUD and job posting CRUD', async () => {
    const companyUser = await createCompanyUser();
    const createdProfile = await repo.create_company_profile({ user_id: companyUser.id, company_name: 'Comp A' } as any);
    expect(createdProfile.user_id).toBe(companyUser.id);

    const found = await repo.find_profile_by_user_id(companyUser.id);
    expect(found?.company_name).toBe('Comp A');

    const updated = await repo.update_company_profile(companyUser.id, { user_id: companyUser.id, company_name: 'Comp B' } as any);
    expect(updated?.company_name).toBe('Comp B');

    const job = await repo.create_job_posting({ company_id: createdProfile.id, description: 'Role X', jobType: JobType.Internship, position: 'Intern', available_position: 5 } as any);
    expect(job.company_id).toBe(createdProfile.id);

    const today = new Date();
    const todayPosts = await repo.find_today_job_postings(createdProfile.id, new Date(today.getFullYear(), today.getMonth(), today.getDate()));
    expect(todayPosts.some(j => j.id === job.id)).toBe(true);

    const allByCompany = await repo.find_all_job_postings_by_company_id(createdProfile.id);
    expect(allByCompany.find(j => j.id === job.id)).toBeTruthy();

    const updatedJob = await repo.update_job_posting(job.id, { description: 'Role X2', jobType: JobType.Internship, position: 'Intern', available_position: 4 } as any);
    expect(updatedJob.available_position).toBe(4);

    const deleted = await repo.delete_job_posting(job.id);
    expect(deleted.id).toBe(job.id);
  });

  it('applications listing, status update and confirmation flow', async () => {
    const companyUser = await createCompanyUser();
    const companyProfile = await repo.create_company_profile({ user_id: companyUser.id, company_name: 'Apps Co' } as any);
    const job = await repo.create_job_posting({ company_id: companyProfile.id, description: 'Engineer', jobType: JobType.FullTime, position: 'Engineer', available_position: 2 } as any);

    const { user: empUser, profile, resume } = await createStudentWithResume();
    const application = await employeeRepo.apply_to_individual_job(job.id, empUser.id, resume.id);

    const list = await repo.find_all_job_applications_by_company_id({ job_post: { company_id: companyProfile.id } }, 'applied_at', 'desc');
    expect(list.length).toBeGreaterThan(0);

    const fetched = await repo.find_job_application_by_id(companyProfile.id, application.id);
    expect(fetched?.job_id).toBe(job.id);

    const updated = await repo.update_job_application_status(application.id, 'Confirmed' as any);
    expect(updated.company_send_status).toBe('Confirmed');

    const notification = await repo.send_the_confirmation_to_employee(application.id, companyUser.id);
    expect(notification.notification_type).toBe('ApplicationConfirmed');
  });
});
