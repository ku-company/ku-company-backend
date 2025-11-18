import request from './_request.js';
import { buildTestApp } from './_app.js';
import announcementRoutes from '../../router/announcementFeedPublicRoutes.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Controller: Announcement feed', () => {
  const app = buildTestApp((a) => {
    a.use('/api/announcements', announcementRoutes);
  });

  let viewerId: number | null = null;
  let profUserId: number | null = null;

  beforeAll(async () => { await prisma.$connect(); });
  afterAll(async () => { await prisma.$disconnect(); });
  afterEach(async () => {
    if (viewerId) { try { await prisma.user.delete({ where: { id: viewerId } }); } catch {} viewerId = null; }
    if (profUserId) { try { await prisma.user.delete({ where: { id: profUserId } }); } catch {} profUserId = null; }
  });

  it('GET /api/announcements returns posts for verified viewer', async () => {
    // Create a viewer and a professor/post in DB for completeness, but mock the service
    // to avoid relying on cross-instance Prisma behavior in CI.
    const viewer = await prisma.user.create({ data: { email: `v-${Date.now()}@ku.th`, role: 'Student', verified: true, status: 'Approved' } });
    viewerId = viewer.id;

    // Mock AnnouncementService so controller returns a stable non-empty response
    jest.resetModules();
    jest.doMock('../../service/announcementService.js', () => {
      return {
        AnnouncementService: class {
          async get_all_posts() {
            return [{ id: 1, content: 'mocked post' }];
          }
        }
      };
    });

    // Re-import routes after mocking the service
    const { default: mockedRoutes } = await import('../../router/announcementFeedPublicRoutes.js');
    const appWithMock = buildTestApp((a) => {
      a.use('/api/announcements', mockedRoutes);
    });

    const res = await request(appWithMock)
      .get('/api/announcements')
      .set('x-user-id', String(viewer.id))
      .set('x-role', 'Student')
      .set('x-verified', 'true');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('GET /api/announcements/:id returns a single post', async () => {
    const viewer = await prisma.user.create({ data: { email: `v-${Date.now()}@ku.th`, role: 'Student', verified: true, status: 'Approved' } });
    viewerId = viewer.id;

    const prof = await prisma.user.create({ data: { email: `pr-${Date.now()}@ku.ac.th`, role: 'Professor', verified: true, status: 'Approved' } });
    profUserId = prof.id;
    const profProfile = await prisma.professorProfile.create({ data: { user_id: prof.id, department: 'CS', faculty: 'ENG' } });
    const post = await prisma.announcement.create({ data: { professor_id: profProfile.id, type_post: 'Opinion', content: 'single post' } });

    const res = await request(app)
      .get(`/api/announcements/${post.id}`)
      .set('x-user-id', String(viewer.id))
      .set('x-role', 'Student')
      .set('x-verified', 'true');

    expect(res.status).toBe(200);
    expect(res.body?.data?.id).toBe(post.id);
  });
});
