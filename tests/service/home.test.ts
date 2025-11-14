import { HomeService } from '../../service/HomeService.js';

// Mock repository methods inside service instance
class MockHomeRepository {
  get_top_companies = jest.fn();
  get_top_job_postings = jest.fn();
}

describe('HomeService.get_top_companies', () => {
  it('passes through repository result', async () => {
    const svc: any = new HomeService();
    const mockRepo = new MockHomeRepository();
    (svc as any).homeRepository = mockRepo;
    const companies = [{ id: 1, _count: { jobPosts: 3 } }];
    mockRepo.get_top_companies.mockResolvedValueOnce(companies);
    const out = await svc.get_top_companies();
    expect(out).toEqual(companies);
    expect(mockRepo.get_top_companies).toHaveBeenCalledTimes(1);
  });
});

describe('HomeService.get_top_job_postings', () => {
  it('adds posted_ago field based on created_at (today, 1 day, many days)', async () => {
    const now = new Date();
    const oneDayAgo = new Date(Date.now() - 86400000);
    const fiveDaysAgo = new Date(Date.now() - 5 * 86400000);
    const svc: any = new HomeService();
    const mockRepo = new MockHomeRepository();
    (svc as any).homeRepository = mockRepo;
    mockRepo.get_top_job_postings.mockResolvedValueOnce([
      { id: 1, created_at: now },
      { id: 2, created_at: oneDayAgo },
      { id: 3, created_at: fiveDaysAgo },
    ]);
    const out = await svc.get_top_job_postings();
    const map = Object.fromEntries(out.map((o: any) => [o.id, o.posted_ago]));
    expect(map[1]).toBe('today');
    expect(map[2]).toBe('1 day ago');
    expect(map[3]).toBe('5 days ago');
  });
});
