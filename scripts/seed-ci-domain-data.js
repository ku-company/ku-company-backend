import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function ensureCompanyDomain() {
  const companyUser = await prisma.user.findUnique({ where: { id: 3 } });
  if (!companyUser) return;
  let profile = await prisma.companyProfile.findUnique({ where: { user_id: companyUser.id } });
  if (!profile) {
    profile = await prisma.companyProfile.create({
      data: {
        user_id: companyUser.id,
        company_name: 'CI Seed Co',
        location: 'Bangkok',
        description: 'Seeded company profile for CI scans.'
      }
    });
  }
  const postings = await prisma.jobPosting.findMany({ where: { company_profile_id: profile.id } });
  if (postings.length === 0) {
    await prisma.jobPosting.create({
      data: {
        company_profile_id: profile.id,
        description: 'Junior Backend Developer',
        jobType: 'FullTime',
        position: 'Backend_Developer',
        available_position: 1,
        status: 'Active'
      }
    });
  }
}

async function ensureEmployeeDomain() {
  const studentUser = await prisma.user.findUnique({ where: { id: 1 } });
  if (!studentUser) return;
  let empProfile = await prisma.employeeProfile.findUnique({ where: { user_id: studentUser.id } });
  if (!empProfile) {
    empProfile = await prisma.employeeProfile.create({ data: { user_id: studentUser.id } });
  }
  const resumes = await prisma.resume.findMany({ where: { employee_id: empProfile.id } });
  if (resumes.length === 0) {
    await prisma.resume.create({
      data: {
        employee_id: empProfile.id,
        file_url: 's3://seed-bucket/resume.pdf',
        is_main: true
      }
    });
  }
}

async function ensureProfessorDomain() {
  const profUser = await prisma.user.findUnique({ where: { id: 2 } });
  if (!profUser) return;
  let profProfile = await prisma.professorProfile.findUnique({ where: { user_id: profUser.id } });
  if (!profProfile) {
    profProfile = await prisma.professorProfile.create({
      data: {
        user_id: profUser.id,
        department: 'Computer Science',
        faculty: 'Engineering',
        position: 'Lecturer'
      }
    });
  }
  const posts = await prisma.professorPost.findMany({ where: { professor_profile_id: profProfile.id } });
  if (posts.length === 0) {
    await prisma.professorPost.create({
      data: {
        professor_profile_id: profProfile.id,
        type: 'Announcement',
        content: 'Welcome to the seeded announcement.'
      }
    });
  }
}

async function main() {
  await ensureCompanyDomain();
  await ensureEmployeeDomain();
  await ensureProfessorDomain();
  console.log('CI domain data seeded.');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
