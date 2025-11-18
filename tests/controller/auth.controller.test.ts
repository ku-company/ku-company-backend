import request from './_request.js';
import { buildTestApp } from './_app.js';
import { AuthService } from '../../service/authService.js';

describe('Controller: Auth', () => {

  beforeAll(() => {
    process.env.SECRET_KEY = process.env.SECRET_KEY || 'secret';
    process.env.REFRESH_KEY = process.env.REFRESH_KEY || 'refresh';
    process.env.CLIENT_URL_DEV = process.env.CLIENT_URL_DEV || 'http://localhost/client';
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('GET /api/auth/failure returns message', async () => {
    jest.resetModules();
    const { default: authRoutes } = await import('../../router/authRoutes.js');
    const cookieParserImport = await import('cookie-parser');
    const cookieParser = (cookieParserImport as any).default || cookieParserImport;
    const app = buildTestApp((a) => {
      // install cookie-parser so `req.cookies` exists
      a.use(cookieParser());
      a.use('/api/auth', authRoutes);
    });
    const res = await request(app).get('/api/auth/failure');
    expect(res.status).toBe(200);
    expect(res.text).toMatch(/Authentication failed/);
  });

  it('GET /api/auth/me returns current user from token', async () => {
    jest.resetModules();
    // Create a valid JWT so AuthService can verify it (don't mock source)
    const jwtImport = await import('jsonwebtoken');
    const jwt = (jwtImport as any).default || jwtImport;
    const payload = { id: 1, user_name: '', email: 'a@b.com', role: 'Student', verified: true };
    const token = jwt.sign(payload, process.env.SECRET_KEY as string || 'secret', { expiresIn: '1h' });

    const { default: authRoutes } = await import('../../router/authRoutes.js');
    const app = buildTestApp((a) => a.use('/api/auth', authRoutes));
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body?.email).toBe('a@b.com');
  });

  it('GET /api/auth/google initiates oauth and redirects', async () => {
    jest.resetModules();
    jest.doMock('passport', () => {
      const authenticate = jest.fn(() => (req: any, res: any) => {
        res.status(302).set('Location', '/google').end();
      });
      return { __esModule: true, default: { authenticate }, authenticate };
    });
    const { default: authRoutes } = await import('../../router/authRoutes.js');
    const app = buildTestApp((a) => a.use('/api/auth', authRoutes));

    const res = await request(app).get('/api/auth/google?role=Student');
    expect(res.status).toBe(302);
    expect(res.header['location']).toBe('/google');
  });

  it('GET /api/auth/google/callback sets cookies and redirects', async () => {
    const user = { id: 1, email: 'a@ku.th', role: 'Student', verified: true } as any;
    jest.resetModules();
    // For callback route, authenticate is invoked at router import time, so mock before importing routes
    jest.doMock('passport', () => {
      const authenticate = jest.fn(() => (req: any, _res: any, next: any) => { req.user = user; next(); });
      return { __esModule: true, default: { authenticate }, authenticate };
    });
    const { default: authRoutes } = await import('../../router/authRoutes.js');
    const app = buildTestApp((a) => a.use('/api/auth', authRoutes));

    const res = await request(app)
      .get('/api/auth/google/callback?state=' + encodeURIComponent(JSON.stringify({ role: 'Student' })));

    expect(res.status).toBe(302);
    expect(res.header['location']).toBe(process.env.CLIENT_URL_DEV);
    const cookies = res.headers['set-cookie'] || [];
    expect(cookies.some((c: string) => c.includes('access_token'))).toBe(true);
    expect(cookies.some((c: string) => c.includes('refresh_token'))).toBe(true);
  });
});
