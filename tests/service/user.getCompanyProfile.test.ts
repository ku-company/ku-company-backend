import { UserService } from '../../service/userService.js';

class MockUserRepository {
  get_company_profile = jest.fn();
}

describe('UserService.get_company_profile', () => {
  it('parses id to number and returns repository result', async () => {
    const svc: any = new UserService();
    const mockRepo = new MockUserRepository();
    (svc as any).userRepository = mockRepo;
    const company = { id: 5, company_name: 'BetaCo' };
    mockRepo.get_company_profile.mockResolvedValueOnce(company);
    const out = await svc.get_company_profile('5');
    expect(out).toEqual(company);
    expect(mockRepo.get_company_profile).toHaveBeenCalledWith(5);
  });
});
