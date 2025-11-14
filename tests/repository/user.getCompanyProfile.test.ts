import { jest } from '@jest/globals';
import { UserRepository } from '../../repository/userRepository.js';

const mockPrisma: any = {
  companyProfile: {
    findUnique: jest.fn(),
  },
};

beforeEach(() => {
  jest.clearAllMocks();
});

function makeRepo() {
  const repo = new UserRepository();
  (repo as any).prisma = mockPrisma;
  return repo;
}

describe('UserRepository.get_company_profile', () => {
  it('returns company profile when found', async () => {
    const repo = makeRepo();
    const company = { id: 10, company_name: 'Acme' };
    mockPrisma.companyProfile.findUnique.mockResolvedValueOnce(company);
    const out = await repo.get_company_profile(10);
    expect(out).toBe(company);
    expect(mockPrisma.companyProfile.findUnique).toHaveBeenCalledWith({ where: { id: 10 } });
  });

  it('throws when not found', async () => {
    const repo = makeRepo();
    mockPrisma.companyProfile.findUnique.mockResolvedValueOnce(null);
    await expect(repo.get_company_profile(999)).rejects.toThrow('Company profile not found');
  });
});
