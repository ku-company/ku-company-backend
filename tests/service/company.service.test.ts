import { jest } from '@jest/globals';

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

it('create_profile throws when profile already exists and creates when absent', async () => {
  // Case: existing profile
  jest.doMock('../../repository/companyRepository.js', () => ({
    CompanyRepository: class { async find_profile_by_user_id(id: number) { return { id: 1 }; } }
  }));
  const { CompanyService } = await import('../../service/companyService.js');
  const svc1 = new CompanyService();
  await expect(svc1.create_profile({ user_id: 1 } as any)).rejects.toThrow('User already has a company profile');

  // Case: no existing profile, but user missing company_name -> user has company_name in userRepository
  jest.resetModules();
  jest.doMock('../../repository/companyRepository.js', () => ({
    CompanyRepository: class {
      async find_profile_by_user_id(id: number) { return null; }
      async create_company_profile(input: any) { return { ...input, id: 5 }; }
    }
  }));
  jest.doMock('../../repository/userRepository.js', () => ({
    UserRepository: class { async get_user_by_id(id: number) { return { id, company_name: 'Acme' }; } }
  }));

  const { CompanyService: CompanyService2 } = await import('../../service/companyService.js');
  const svc2 = new CompanyService2();
  const res = await svc2.create_profile({ user_id: 2 } as any);
  expect(res).toHaveProperty('id', 5);
});

it('create_job_posting validates company profile and salary bounds', async () => {
  // company profile missing
  jest.doMock('../../repository/companyRepository.js', () => ({
    CompanyRepository: class { async find_profile_by_user_id(id: number) { return null; } }
  }));
  const { CompanyService } = await import('../../service/companyService.js');
  const svc = new CompanyService();
  await expect(svc.create_job_posting(1, { job_title: 'X' } as any)).rejects.toThrow('Company profile not found');

  // company present but salary invalid
  jest.resetModules();
  jest.doMock('../../repository/companyRepository.js', () => ({
    CompanyRepository: class {
      async find_profile_by_user_id(id: number) { return { id: 10, user_id: 3 }; }
      async find_today_job_postings(id: number, d: Date) { return []; }
      async create_job_posting(input: any) { return { id: 99, ...input }; }
    }
  }));
  jest.doMock('../../repository/userRepository.js', () => ({ UserRepository: class { async get_user_by_id(id: number) { return { id, verified: true }; } } }));
  jest.doMock('../../repository/aiRepository.js', () => ({ AIRepository: class { async verify_jobPosting_by_ai(id: number) { return { trust_level: 'High' }; } } }));

  const { CompanyService: CompanyService3 } = await import('../../service/companyService.js');
  const svc3 = new CompanyService3();
  await expect(svc3.create_job_posting(3, { minimum_expected_salary: 1000, maximum_expected_salary: 10 } as any)).rejects.toThrow('Minimum expected salary cannot be greater than maximum expected salary');

  // valid creation
  const job = await svc3.create_job_posting(3, { job_title: 'Dev', minimum_expected_salary: 10, maximum_expected_salary: 100 } as any);
  expect(job).toHaveProperty('id', 99);
});

it('get_all_job_postings throws when profile missing and returns postings when present', async () => {
  jest.doMock('../../repository/companyRepository.js', () => ({
    CompanyRepository: class { async find_profile_by_user_id(id: number) { return null; } }
  }));
  const { CompanyService } = await import('../../service/companyService.js');
  const svc = new CompanyService();
  await expect(svc.get_all_job_postings(1)).rejects.toThrow('Company profile not found');

  jest.resetModules();
  jest.doMock('../../repository/companyRepository.js', () => ({
    CompanyRepository: class { async find_profile_by_user_id(id: number) { return { id: 20 }; } async find_all_job_postings_by_company_id(id: number) { return [{ id: 1 }]; } }
  }));
  const { CompanyService: CompanyService2 } = await import('../../service/companyService.js');
  const svc2 = new CompanyService2();
  const res = await svc2.get_all_job_postings(2);
  expect(Array.isArray(res)).toBe(true);
});
