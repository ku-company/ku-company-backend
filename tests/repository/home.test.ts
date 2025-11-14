import { jest } from '@jest/globals';
import { HomeRepository } from '../../repository/HomeRepository.js';

// Minimal mocked prisma client
const mockPrisma: any = {
  companyProfile: {
    findMany: jest.fn(),
  },
  jobPost: {
    findMany: jest.fn(),
  },
};

beforeEach(() => {
  jest.clearAllMocks();
});

function makeRepo() {
  const repo = new HomeRepository();
  (repo as any).prisma = mockPrisma; // inject mock
  return repo;
}

describe('HomeRepository.get_top_companies', () => {
  it('queries top 10 companies ordered by jobPosts count desc and includes _count.jobPosts', async () => {
    const repo = makeRepo();
    const sample = [{ id: 1, _count: { jobPosts: 5 } }];
    mockPrisma.companyProfile.findMany.mockResolvedValueOnce(sample);
    const out = await repo.get_top_companies();
    expect(out).toBe(sample);
    expect(mockPrisma.companyProfile.findMany).toHaveBeenCalledWith({
      take: 10,
      orderBy: { jobPosts: { _count: 'desc' } },
      include: { _count: { select: { jobPosts: true } } },
    });
  });
});

describe('HomeRepository.get_top_job_postings', () => {
  it('queries top 3 most recent job posts including company', async () => {
    const repo = makeRepo();
    const sample = [{ id: 10, company: { id: 1 } }];
    mockPrisma.jobPost.findMany.mockResolvedValueOnce(sample);
    const out = await repo.get_top_job_postings();
    expect(out).toBe(sample);
    expect(mockPrisma.jobPost.findMany).toHaveBeenCalledWith({
      take: 3,
      orderBy: { created_at: 'desc' },
      include: { company: true },
    });
  });
});
