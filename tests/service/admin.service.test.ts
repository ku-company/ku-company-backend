import { jest } from '@jest/globals';

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

it('list_filtering_jobPosting accepts true/false and throws on invalid', async () => {
  // Mock AdminRepository used by the service
  jest.doMock('../../repository/adminRepository.js', () => {
    return {
      AdminRepository: class {
        async list_jobPosting_filtering(v: boolean) {
          return [{ id: 1, verified: v }];
        }
        async list_jobPosting() { return []; }
      }
    };
  });

  const { AdminService } = await import('../../service/adminService.js');
  const svc = new AdminService();

  const resTrue = await svc.list_filtering_jobPosting('true');
  expect(Array.isArray(resTrue)).toBe(true);
  expect((resTrue as any[]).length).toBeGreaterThan(0);
  expect((resTrue as any[])[0].verified).toBe(true);

  const resFalse = await svc.list_filtering_jobPosting('false');
  expect((resFalse as any[]).length).toBeGreaterThan(0);
  expect((resFalse as any[])[0].verified).toBe(false);

  await expect(svc.list_filtering_jobPosting('not-bool')).rejects.toThrow("Invalid 'verified' query; use true/false");
});
