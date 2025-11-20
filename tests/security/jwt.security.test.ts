import jwt from 'jsonwebtoken';
import { UserService } from '../../service/userService.js';

describe('Security: JWT algorithms', () => {
  const userService = new UserService();
  const payload = { id: 1, user_name: 'u', email: 'e@t.com', role: 'Student', verified: true } as any;

  beforeAll(() => {
    process.env.SECRET_KEY = process.env.SECRET_KEY || 'test-secret';
    process.env.REFRESH_KEY = process.env.REFRESH_KEY || 'test-refresh';
  });

  it('accepts HS256 and rejects tampered signature', async () => {
    const token = jwt.sign(payload, process.env.REFRESH_KEY as string, { algorithm: 'HS256', expiresIn: '5m' });
    const parts = token.split('.');
    // Tamper payload without resigning
    const fakePayload = Buffer.from(JSON.stringify({ ...payload, role: 'Admin' })).toString('base64url');
    const tampered = [parts[0], fakePayload, parts[2]].join('.');
    await expect(userService.refresh_token(tampered)).rejects.toThrow('Invalid refresh token');
  });

  it('rejects token with alg none', async () => {
    // Craft a token with alg "none" (no signature)
    const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + 300 })).toString('base64url');
    const algNone = `${header}.${body}.`;
    await expect(userService.refresh_token(algNone)).rejects.toThrow('Invalid refresh token');
  });
});
