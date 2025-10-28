import request from './_request.js';
import { buildTestApp } from './_app.js';
// Mock AIService to avoid loading AIRepository/dotenv internals
jest.mock('../../service/aiService.js', () => ({
  AIService: jest.fn().mockImplementation(() => ({
    verify_user: jest.fn().mockResolvedValue({ id: 1, verified: true })
  }))
}));
import aiRoutes from '../../router/aiRoutes.js';

describe('Controller: AI', () => {
  const app = buildTestApp((a) => {
    a.use('/api/ai', aiRoutes);
  });

  it('POST /api/ai/verify-user/:id returns 200', async () => {
    const res = await request(app)
      .post('/api/ai/verify-user/1');
    expect(res.status).toBe(200);
    expect(res.body?.data?.verified).toBe(true);
  });
});
