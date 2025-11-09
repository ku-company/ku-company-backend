import request from './_request.js';
import { buildTestApp } from './_app.js';
import professorRoutes from '../../router/professorRoutes.js';
import { ProfessorService } from '../../service/professorService.js';
import { PrismaClient } from '@prisma/client';

jest.mock('nodemailer', () => {
  const createTransport = jest.fn(() => ({
    sendMail: jest.fn(),
  }));
  return {
    __esModule: true,
    default: { createTransport },
    createTransport,
  };
});

const prisma = new PrismaClient();

describe('Controller: Professor', () => {
  const app = buildTestApp((a) => {
    a.use('/api/professor', professorRoutes);
  });

  let userId: number | null = null;

  beforeAll(async () => { await prisma.$connect(); });
  afterAll(async () => { await prisma.$disconnect(); });
  afterEach(async () => { if (userId) { try { await prisma.user.delete({ where: { id: userId } }); } catch {} userId = null; } });

  it('GET /api/professor/my-profile returns profile for professor', async () => {
    // Mock service to avoid DB include issues and focus on controller behavior
    const gspy = jest
      .spyOn(ProfessorService.prototype, 'get_profile')
      .mockResolvedValue({ user_id: 999, department: 'CS', faculty: 'ENG' } as any);

    const user = await prisma.user.create({ data: { email: `p-${Date.now()}@ku.ac.th`, role: 'Professor', verified: true, status: 'Approved' } });
    userId = user.id;
    await prisma.professorProfile.create({ data: { user_id: user.id, department: 'CS', faculty: 'ENG' } });

    const res = await request(app)
      .get('/api/professor/my-profile')
      .set('x-user-id', String(user.id))
      .set('x-role', 'Professor')
      .set('x-verified', 'true');

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();

    gspy.mockRestore();
  });

  it('POST/PATCH/DELETE /api/professor/my-profile manage profile', async () => {
    const cspy = jest.spyOn(ProfessorService.prototype, 'create_profile').mockResolvedValue({ id: 1 } as any);
    const espy = jest.spyOn(ProfessorService.prototype, 'edit_profile').mockResolvedValue({ id: 1, first_name: 'P' } as any);
    const dspy = jest.spyOn(ProfessorService.prototype, 'delete_profile').mockResolvedValue({ id: 1 } as any);

    const createRes = await request(app)
      .post('/api/professor/my-profile')
      .set('x-user-id', '1')
      .set('x-role', 'Professor')
      .set('x-verified', 'true')
      .send({ department: 'CS', faculty: 'ENG' });
    expect(createRes.status).toBe(201);

    const editRes = await request(app)
      .patch('/api/professor/my-profile')
      .set('x-user-id', '1')
      .set('x-role', 'Professor')
      .set('x-verified', 'true')
      .send({ first_name: 'P' });
    expect(editRes.status).toBe(200);

    const delRes = await request(app)
      .delete('/api/professor/my-profile')
      .set('x-user-id', '1')
      .set('x-role', 'Professor')
      .set('x-verified', 'true');
    expect(delRes.status).toBe(200);

    cspy.mockRestore(); espy.mockRestore(); dspy.mockRestore();
  });

  it('Comments endpoints respond', async () => {
    const aspy = jest.spyOn(ProfessorService.prototype, 'add_comment_to_company').mockResolvedValue({ id: 2 } as any);
    const espy = jest.spyOn(ProfessorService.prototype, 'edit_comment').mockResolvedValue({ id: 2, comment: 'ok' } as any);
    const dspy = jest.spyOn(ProfessorService.prototype, 'delete_comment').mockResolvedValue({ id: 2 } as any);

    const addRes = await request(app)
      .post('/api/professor/comment/9')
      .set('x-user-id', '1')
      .set('x-role', 'Professor')
      .set('x-verified', 'true')
      .send({ comment: 'hi' });
    expect(addRes.status).toBe(200);

    const editRes = await request(app)
      .patch('/api/professor/comment/2/edit')
      .set('x-user-id', '1')
      .set('x-role', 'Professor')
      .set('x-verified', 'true')
      .send({ comment: 'ok' });
    expect(editRes.status).toBe(200);

    const delRes = await request(app)
      .delete('/api/professor/comment/2/delete')
      .set('x-user-id', '1')
      .set('x-role', 'Professor')
      .set('x-verified', 'true');
    expect(delRes.status).toBe(200);

    aspy.mockRestore(); espy.mockRestore(); dspy.mockRestore();
  });

  it('Repost job endpoints respond', async () => {
    const rspy = jest.spyOn(ProfessorService.prototype, 'repost_job').mockResolvedValue({ id: 3 } as any);
    const gspy = jest.spyOn(ProfessorService.prototype, 'get_all_repost_job').mockResolvedValue([] as any);

    const listRes = await request(app)
      .get('/api/professor/job-postings/all-reposts')
      .set('x-user-id', '1')
      .set('x-role', 'Professor')
      .set('x-verified', 'true');
    expect(listRes.status).toBe(200);

    const repostRes = await request(app)
      .post('/api/professor/job-postings/repost/10')
      .set('x-user-id', '1')
      .set('x-role', 'Professor')
      .set('x-verified', 'true')
      .send({ content: 'repost' });
    expect(repostRes.status).toBe(200);

    rspy.mockRestore(); gspy.mockRestore();
  });

  it('Announcements and opinions endpoints respond', async () => {
    const caspy = jest.spyOn(ProfessorService.prototype, 'create_announcement').mockResolvedValue({ id: 4 } as any);
    const gaspy = jest.spyOn(ProfessorService.prototype, 'get_all_announcement').mockResolvedValue([] as any);
    const cospy = jest.spyOn(ProfessorService.prototype, 'create_opinion').mockResolvedValue({ id: 5 } as any);
    const gosby = jest.spyOn(ProfessorService.prototype, 'get_all_opinions').mockResolvedValue([] as any);

    const cRes = await request(app)
      .post('/api/professor/announcements')
      .set('x-user-id', '1')
      .set('x-role', 'Professor')
      .set('x-verified', 'true')
      .send({ content: 'announce' });
    expect(cRes.status).toBe(201);

    const gaRes = await request(app)
      .get('/api/professor/announcements/all')
      .set('x-user-id', '1')
      .set('x-role', 'Professor')
      .set('x-verified', 'true');
    expect(gaRes.status).toBe(200);

    const coRes = await request(app)
      .post('/api/professor/opinions')
      .set('x-user-id', '1')
      .set('x-role', 'Professor')
      .set('x-verified', 'true')
      .send({ content: 'op' });
    expect(coRes.status).toBe(201);

    const goRes = await request(app)
      .get('/api/professor/opinions/all')
      .set('x-user-id', '1')
      .set('x-role', 'Professor')
      .set('x-verified', 'true');
    expect(goRes.status).toBe(200);

    caspy.mockRestore(); gaspy.mockRestore(); cospy.mockRestore(); gosby.mockRestore();
  });

  it('Posts endpoints respond', async () => {
    const gaspy = jest.spyOn(ProfessorService.prototype, 'get_all_posts').mockResolvedValue([] as any);
    const gspy = jest.spyOn(ProfessorService.prototype, 'get_post_by_id').mockResolvedValue({ id: 6 } as any);
    const espy = jest.spyOn(ProfessorService.prototype, 'edit_post').mockResolvedValue({ id: 6, content: 'e' } as any);
    const dspy = jest.spyOn(ProfessorService.prototype, 'delete_post').mockResolvedValue({ id: 6 } as any);

    const allRes = await request(app)
      .get('/api/professor/posts/all')
      .set('x-user-id', '1')
      .set('x-role', 'Professor')
      .set('x-verified', 'true');
    expect(allRes.status).toBe(200);

    const getRes = await request(app)
      .get('/api/professor/posts/6')
      .set('x-user-id', '1')
      .set('x-role', 'Professor')
      .set('x-verified', 'true');
    expect(getRes.status).toBe(200);

    const editRes = await request(app)
      .patch('/api/professor/posts/6')
      .set('x-user-id', '1')
      .set('x-role', 'Professor')
      .set('x-verified', 'true')
      .send({ content: 'e' });
    expect(editRes.status).toBe(200);

    const delRes = await request(app)
      .delete('/api/professor/posts/6')
      .set('x-user-id', '1')
      .set('x-role', 'Professor')
      .set('x-verified', 'true');
    expect(delRes.status).toBe(200);

    gaspy.mockRestore(); gspy.mockRestore(); espy.mockRestore(); dspy.mockRestore();
  });
});
