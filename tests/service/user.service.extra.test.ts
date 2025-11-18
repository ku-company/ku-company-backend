import { jest } from '@jest/globals';

let UserService: any;
beforeAll(async () => {
  const mod: any = await import('../../service/userService.js');
  UserService = mod.UserService;
});

describe('UserService extra unit tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('refresh_token throws when REFRESH_KEY missing', async () => {
    const orig = process.env.REFRESH_KEY;
    delete process.env.REFRESH_KEY;
    const svc = new UserService();
    await expect(svc.refresh_token('dummy')).rejects.toThrow('Missing REFRESH_KEY');
    process.env.REFRESH_KEY = orig;
  });
});
