import request from './_request.js';
import { buildTestApp } from './_app.js';
// Mock multer-based middlewares to no-op
jest.mock('../../middlewares/uploadPdfMiddleware', () => ({ uploadPdf: { array: () => (_req: any, _res: any, next: any) => next() } }));
jest.mock('../../middlewares/uploadImageMiddleware', () => ({ uploadImage: { single: () => (_req: any, _res: any, next: any) => next() } }));

import employeeRoutes from '../../router/employeeRoutes.js';
import { EmployeeService } from '../../service/employeeService.js';
import { UserService } from '../../service/userService.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Controller: Employee', () => {
  const app = buildTestApp((a) => {
    a.use('/api/employee', employeeRoutes);
  });

  let userId: number | null = null;
  let profileId: number | null = null;

  beforeAll(async () => { await prisma.$connect(); });
  afterAll(async () => { await prisma.$disconnect(); });
  afterEach(async () => { if (userId) { try { await prisma.user.delete({ where: { id: userId } }); } catch {} userId = null; profileId = null; } });

  it('GET /api/employee/my-resumes returns resumes (role Student, verified)', async () => {
    const user = await prisma.user.create({ data: { email: `e-${Date.now()}@ku.th`, role: 'Student', verified: true, status: 'Approved' } });
    userId = user.id;
    const profile = await prisma.employeeProfile.create({ data: { user_id: user.id } });
    profileId = profile.id;
    await prisma.resume.create({ data: { employee_id: profile.id, file_url: 's3://bucket/r.pdf', is_main: true } });

    const res = await request(app)
      .get('/api/employee/my-resumes')
      .set('x-user-id', String(user.id))
      .set('x-role', 'Student')
      .set('x-verified', 'true');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('POST /api/employee/my-profile/create creates profile (201)', async () => {
    const spy = jest.spyOn(EmployeeService.prototype, 'create_profile').mockResolvedValue({ id: 1 } as any);
    const res = await request(app)
      .post('/api/employee/my-profile/create')
      .set('x-user-id', '1')
      .set('x-role', 'Student')
      .send({ first_name: 'A' });
    expect(res.status).toBe(201);
    expect(res.body?.data?.id).toBe(1);
    spy.mockRestore();
  });

  it('GET /api/employee/my-profile returns profile', async () => {
    const spy = jest.spyOn(EmployeeService.prototype, 'get_profile').mockResolvedValue({ id: 1 } as any);
    const res = await request(app)
      .get('/api/employee/my-profile')
      .set('x-user-id', '1')
      .set('x-role', 'Student');
    expect(res.status).toBe(200);
    expect(res.body?.data?.id).toBe(1);
    spy.mockRestore();
  });

  it('PATCH /api/employee/my-profile/edit updates profile', async () => {
    const spy = jest.spyOn(EmployeeService.prototype, 'edit_profile').mockResolvedValue({ id: 1, first_name: 'B' } as any);
    const res = await request(app)
      .patch('/api/employee/my-profile/edit')
      .set('x-user-id', '1')
      .set('x-role', 'Student')
      .send({ first_name: 'B' });
    expect(res.status).toBe(200);
    expect(res.body?.data?.first_name).toBe('B');
    spy.mockRestore();
  });

  it('DELETE /api/employee/my-profile/delete deletes profile', async () => {
    const spy = jest.spyOn(EmployeeService.prototype, 'delete_profile').mockResolvedValue({ success: true } as any);
    const res = await request(app)
      .delete('/api/employee/my-profile/delete')
      .set('x-user-id', '1')
      .set('x-role', 'Student');
    expect(res.status).toBe(200);
    spy.mockRestore();
  });

  it('POST /api/employee/profile/image without file returns 400', async () => {
    const res = await request(app)
      .post('/api/employee/profile/image')
      .set('x-user-id', '1')
      .set('x-role', 'Student')
      .set('x-verified', 'true');
    expect(res.status).toBe(400);
  });

  it('GET /api/employee/profile/image returns profile_image', async () => {
    const spy = jest.spyOn(UserService.prototype, 'get_profile_image').mockResolvedValue('url://image' as any);
    const res = await request(app)
      .get('/api/employee/profile/image')
      .set('x-user-id', '1')
      .set('x-role', 'Student')
      .set('x-verified', 'true');
    expect(res.status).toBe(200);
    expect(res.body?.profile_image).toBe('url://image');
    spy.mockRestore();
  });

  it('PATCH /api/employee/profile/image without file returns 400', async () => {
    const res = await request(app)
      .patch('/api/employee/profile/image')
      .set('x-user-id', '1')
      .set('x-role', 'Student')
      .set('x-verified', 'true');
    expect(res.status).toBe(400);
  });

  it('DELETE /api/employee/profile/image returns success', async () => {
    const spy = jest.spyOn(UserService.prototype, 'delete_profile_image').mockResolvedValue(undefined as any);
    const res = await request(app)
      .delete('/api/employee/profile/image')
      .set('x-user-id', '1')
      .set('x-role', 'Student')
      .set('x-verified', 'true');
    expect(res.status).toBe(200);
    spy.mockRestore();
  });

  it('POST /api/employee/profile/resumes without files returns 400', async () => {
    const res = await request(app)
      .post('/api/employee/profile/resumes')
      .set('x-user-id', '1')
      .set('x-role', 'Student')
      .set('x-verified', 'true');
    expect(res.status).toBe(400);
  });

  it('GET /api/employee/profile/resumes returns list', async () => {
    const spy = jest.spyOn(EmployeeService.prototype, 'get_all_resumes').mockResolvedValue([] as any);
    const res = await request(app)
      .get('/api/employee/profile/resumes')
      .set('x-user-id', '1')
      .set('x-role', 'Student')
      .set('x-verified', 'true');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body?.resumes)).toBe(true);
    spy.mockRestore();
  });

  it('GET /api/employee/profile/resumes/main returns item', async () => {
    const spy = jest.spyOn(EmployeeService.prototype, 'get_main_resume').mockResolvedValue({ id: 1 } as any);
    const res = await request(app)
      .get('/api/employee/profile/resumes/main')
      .set('x-user-id', '1')
      .set('x-role', 'Student')
      .set('x-verified', 'true');
    expect(res.status).toBe(200);
    expect(res.body?.resume?.id).toBe(1);
    spy.mockRestore();
  });

  it('GET /api/employee/profile/resumes/:id returns item', async () => {
    const spy = jest.spyOn(EmployeeService.prototype, 'get_resume').mockResolvedValue({ id: 2 } as any);
    const res = await request(app)
      .get('/api/employee/profile/resumes/2')
      .set('x-user-id', '1')
      .set('x-role', 'Student')
      .set('x-verified', 'true');
    expect(res.status).toBe(200);
    expect(res.body?.resume?.id).toBe(2);
    spy.mockRestore();
  });

  it('DELETE /api/employee/profile/resumes/:id returns 200', async () => {
    const spy = jest.spyOn(EmployeeService.prototype, 'delete_resume').mockResolvedValue(undefined as any);
    const res = await request(app)
      .delete('/api/employee/profile/resumes/2')
      .set('x-user-id', '1')
      .set('x-role', 'Student')
      .set('x-verified', 'true');
    expect(res.status).toBe(200);
    spy.mockRestore();
  });

  it('DELETE /api/employee/profile/resumes returns 200', async () => {
    const spy = jest.spyOn(EmployeeService.prototype, 'delete_all_resumes').mockResolvedValue(undefined as any);
    const res = await request(app)
      .delete('/api/employee/profile/resumes')
      .set('x-user-id', '1')
      .set('x-role', 'Student')
      .set('x-verified', 'true');
    expect(res.status).toBe(200);
    spy.mockRestore();
  });

  it('PATCH /api/employee/profile/resumes/:id/set-main returns 200', async () => {
    const spy = jest.spyOn(EmployeeService.prototype, 'set_main_resume').mockResolvedValue(undefined as any);
    const res = await request(app)
      .patch('/api/employee/profile/resumes/3/set-main')
      .set('x-user-id', '1')
      .set('x-role', 'Student')
      .set('x-verified', 'true');
    expect(res.status).toBe(200);
    spy.mockRestore();
  });

  it('POST /api/employee/apply-job/:id returns 200', async () => {
    const spy = jest.spyOn(EmployeeService.prototype, 'apply_to_individual_job').mockResolvedValue({ id: 10 } as any);
    const res = await request(app)
      .post('/api/employee/apply-job/9')
      .set('x-user-id', '1')
      .set('x-role', 'Student')
      .send({ resume_id: 5 });
    expect(res.status).toBe(200);
    expect(res.body?.data?.id).toBe(10);
    spy.mockRestore();
  });

  it('DELETE /api/employee/cancel-application/:id returns 200', async () => {
    const spy = jest.spyOn(EmployeeService.prototype, 'cancel_application').mockResolvedValue({ id: 9 } as any);
    const res = await request(app)
      .delete('/api/employee/cancel-application/9')
      .set('x-user-id', '1')
      .set('x-role', 'Student');
    expect(res.status).toBe(200);
    spy.mockRestore();
  });

  it('GET /api/employee/my-applications returns list', async () => {
    const spy = jest.spyOn(EmployeeService.prototype, 'list_all_applications').mockResolvedValue([] as any);
    const res = await request(app)
      .get('/api/employee/my-applications')
      .set('x-user-id', '1')
      .set('x-role', 'Student');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body?.data)).toBe(true);
    spy.mockRestore();
  });

  it('POST /api/employee/checkout/apply-jobs returns 200', async () => {
    const spy = jest.spyOn(EmployeeService.prototype, 'checkout_list_apply_jobs').mockResolvedValue([{ id: 1 }] as any);
    const res = await request(app)
      .post('/api/employee/checkout/apply-jobs')
      .set('x-user-id', '1')
      .set('x-role', 'Student')
      .send({ resume_id: 1, job_id: [1,2] });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body?.data)).toBe(true);
    spy.mockRestore();
  });

  it('POST /api/employee/job-applications/:id/confirm returns 200', async () => {
    const spy = jest.spyOn(EmployeeService.prototype, 'sent_the_confirmation_to_company').mockResolvedValue({ id: 7 } as any);
    const res = await request(app)
      .post('/api/employee/job-applications/7/confirm')
      .set('x-user-id', '1')
      .set('x-role', 'Student');
    expect(res.status).toBe(200);
    spy.mockRestore();
  });
});
