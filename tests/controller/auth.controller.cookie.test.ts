import request from './_request.js';
import { buildTestApp } from './_app.js';

describe('Controller: Auth (cookies)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetModules();
  });

  it('GET /api/auth/me reads token from cookie when Authorization header missing', async () => {
    // Mock AuthService used by the controller so we can assert cookie branch
    jest.resetModules();
    jest.doMock('../../service/authService.js', () => {
      return {
        AuthService: class {
          async getCurrentUser(token: string) {
            return { id: 42, email: 'cookie-user@example.com' };
          }
        }
      };
    });

    const { default: authRoutes } = await import('../../router/authRoutes.js');
    const app = buildTestApp((a) => a.use('/api/auth', authRoutes));

    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', 'access_token=some-cookie-token');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('email', 'cookie-user@example.com');
  });
});
