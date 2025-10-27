/**
 * Unit tests for CompanyService
 * We patch the service's repositories and S3 service with Jest mocks to avoid DB/S3.
 */

import { jest } from '@jest/globals';

let CompanyService: any;
beforeAll(async () => {
	const mod: any = await import('../../service/companyService.js');
	CompanyService = mod.CompanyService;
});

describe('CompanyService', () => {
	const makeSvc = () => new CompanyService();

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('create_profile', () => {
		it('throws if profile already exists', async () => {
			const svc = makeSvc();
			(svc as any).companyRepository = {
				find_profile_by_user_id: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue({ id: 1 }),
			} as any;
			await expect(svc.create_profile({ user_id: 10 } as any)).rejects.toThrow(
				'User already has a company profile'
			);
		});

		it('uses user.company_name when input.company_name missing', async () => {
			const svc = makeSvc();
			const repo = {
				find_profile_by_user_id: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue(null),
				create_company_profile: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue({ id: 99 }),
			} as any;
			(svc as any).companyRepository = repo;
			(svc as any).userRepository = {
				get_user_by_id: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue({ company_name: 'Acme' }),
			} as any;
			const out = await svc.create_profile({ user_id: 7 } as any);
			expect(out).toEqual({ id: 99 });
			expect(repo.create_company_profile).toHaveBeenCalledWith(
				expect.objectContaining({ user_id: 7, company_name: 'Acme' })
			);
		});

		it('throws if company_name missing and user has none', async () => {
			const svc = makeSvc();
			(svc as any).companyRepository = { find_profile_by_user_id: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue(null) } as any;
			(svc as any).userRepository = { get_user_by_id: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue({}) } as any;
			await expect(svc.create_profile({ user_id: 7 } as any)).rejects.toThrow('Company name is required');
		});
	});

	describe('get/update profile', () => {
		it('get_profile returns profile', async () => {
			const svc = makeSvc();
			(svc as any).companyRepository = { find_profile_by_user_id: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue({ id: 5 }) } as any;
			await expect(svc.get_profile(1)).resolves.toEqual({ id: 5 });
		});

		it('update_profile throws if not found', async () => {
			const svc = makeSvc();
			(svc as any).companyRepository = { find_profile_by_user_id: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue(null) } as any;
			await expect(svc.update_profile({ user_id: 1 } as any)).rejects.toThrow('Company profile not found');
		});

		it('update_profile fills defaults and updates', async () => {
			const svc = makeSvc();
			const existing = {
				user_id: 9,
				company_name: 'OldCo',
				description: 'Desc',
				industry: 'Tech',
				tel: '123',
				location: 'BKK',
				country: 'TH',
			};
			const repo = {
				find_profile_by_user_id: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue(existing),
				update_company_profile: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue({ id: 1 }),
			} as any;
			(svc as any).companyRepository = repo;
			const result = await svc.update_profile({ user_id: 9, description: 'NewDesc' } as any);
			expect(result).toEqual({ id: 1 });
			const call = repo.update_company_profile.mock.calls[0]!;
			expect(call[0]).toBe(9);
			expect(call[1]).toEqual(
				expect.objectContaining({
					user_id: 9,
					company_name: 'OldCo',
					description: 'NewDesc',
					industry: 'Tech',
					tel: '123',
					location: 'BKK',
					country: 'TH',
				})
			);
		});
	});

	describe('job postings', () => {
		it('create_job_posting throws if no company profile', async () => {
			const svc = makeSvc();
			(svc as any).companyRepository = { find_profile_by_user_id: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue(null) } as any;
			await expect(
				svc.create_job_posting(1, { description: 'd', jobType: 'FullTime', position: 'Backend_Developer', available_position: 1 } as any)
			).rejects.toThrow('Company profile not found');
		});

		it('create_job_posting enforces 5/day limit for unverified users', async () => {
			const svc = makeSvc();
			(svc as any).companyRepository = {
				find_profile_by_user_id: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue({ id: 10, user_id: 5 }),
				find_today_job_postings: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue([1, 2, 3, 4, 5]),
			} as any;
			(svc as any).userRepository = { get_user_by_id: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue({ verified: false }) } as any;
			await expect(
				svc.create_job_posting(5, { description: 'd', jobType: 'FullTime', position: 'Backend_Developer', available_position: 1 } as any)
			).rejects.toThrow('Maximum job postings for today reached');
		});

		it('create_job_posting creates when within limit or verified', async () => {
			const svc = makeSvc();
			const repo = {
				find_profile_by_user_id: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue({ id: 10, user_id: 5 }),
				find_today_job_postings: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue([1, 2, 3]),
				create_job_posting: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue({ id: 88 }),
			} as any;
			(svc as any).companyRepository = repo;
			(svc as any).userRepository = { get_user_by_id: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue({ verified: false }) } as any;
			const out = await svc.create_job_posting(5, {
				description: 'd',
				jobType: 'FullTime',
				position: 'Backend_Developer',
				available_position: 1,
			} as any);
			expect(out).toEqual({ id: 88 });
			expect(repo.create_job_posting).toHaveBeenCalledWith({
				company_id: 10,
				description: 'd',
				jobType: 'FullTime',
				position: 'Backend_Developer',
				available_position: 1,
			});
		});

		it('update_job_posting throws if post not found', async () => {
			const svc = makeSvc();
			(svc as any).companyRepository = { find_job_posting_by_id: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue(null) } as any;
			await expect(svc.update_job_posting(10, { description: 'x' } as any)).rejects.toThrow('Job posting not found');
		});

		it('update_job_posting fills defaults and updates', async () => {
			const svc = makeSvc();
			const repo = {
				find_job_posting_by_id: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue({ description: 'old', jobType: 'FullTime', position: 'Backend_Developer', available_position: 2 }),
				update_job_posting: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue({ id: 1 }),
			} as any;
			(svc as any).companyRepository = repo;
			const out = await svc.update_job_posting(12, { description: 'new' } as any);
			expect(out).toEqual({ id: 1 });
			expect(repo.update_job_posting).toHaveBeenCalledWith(12, {
				description: 'new',
				jobType: 'FullTime',
				position: 'Backend_Developer',
				available_position: 2,
			});
		});

		it('get_job_posting proxies', async () => {
			const svc = makeSvc();
			(svc as any).companyRepository = { find_job_posting_by_id: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue({ id: 2 }) } as any;
			await expect(svc.get_job_posting(2)).resolves.toEqual({ id: 2 });
		});

		it('get_all_job_postings needs profile', async () => {
			const svc = makeSvc();
			(svc as any).companyRepository = { find_profile_by_user_id: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue(null) } as any;
			await expect(svc.get_all_job_postings(1)).rejects.toThrow('Company profile not found');

			(svc as any).companyRepository = {
				find_profile_by_user_id: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue({ id: 3 }),
				find_all_job_postings_by_company_id: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue([{ id: 1 }]),
			} as any;
			await expect(svc.get_all_job_postings(1)).resolves.toEqual([{ id: 1 }]);
		});

		it('delete_job_posting requires existing post', async () => {
			const svc = makeSvc();
			(svc as any).companyRepository = { find_job_posting_by_id: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue(null) } as any;
			await expect(svc.delete_job_posting(1)).rejects.toThrow('Job posting not found');

			const repo = {
				find_job_posting_by_id: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue({ id: 1 }),
				delete_job_posting: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue({ ok: 1 }),
			} as any;
			(svc as any).companyRepository = repo;
			await expect(svc.delete_job_posting(1)).resolves.toEqual({ ok: 1 });
			expect(repo.delete_job_posting).toHaveBeenCalledWith(1);
		});
	});

	describe('applications list/get/update', () => {
		it('get_all_job_applications requires profile, signs resume urls, and applies status filter if valid', async () => {
			const svc = makeSvc();
			const repo = {
				find_profile_by_user_id: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue({ id: 8 }),
				find_all_job_applications_by_company_id: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue([
					{ id: 1, resume_url: 'key1' },
					{ id: 2, resume_url: '' },
				]),
			} as any;
			(svc as any).companyRepository = repo;
			(svc as any).s3Service = { getFileUrl: jest.fn<(...args: any[]) => Promise<string>>().mockResolvedValueOnce('signed1').mockResolvedValueOnce('') };
			const out = await svc.get_all_job_applications({ user_id: 1, sortOrder: 'desc', status: 'Pending', sortField: 'applied_at' });
			expect(out[0].resume_url).toBe('signed1');
			// ensure filters include company id and status when valid
			const filters = repo.find_all_job_applications_by_company_id.mock.calls[0][0];
			expect(filters).toMatchObject({ job_post: { company_id: 8 }, status: { contains: 'Pending', mode: 'insensitive' } });
		});

		it('get_job_application requires profile and found application; signs resume', async () => {
			const svc = makeSvc();
			(svc as any).companyRepository = {
				find_profile_by_user_id: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue({ id: 9 }),
				find_job_application_by_id: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValueOnce(null).mockResolvedValueOnce({ id: 1, resume_url: 'key' }),
			} as any;
			(svc as any).s3Service = { getFileUrl: jest.fn<(...args: any[]) => Promise<string>>().mockResolvedValue('signed') };
			await expect(svc.get_job_application(1, 2)).rejects.toThrow('Job application not found');
			const out = await svc.get_job_application(1, 2);
			expect(out.resume_url).toBe('signed');
		});

		it('update_job_application_status validates and proxies', async () => {
			const svc = makeSvc();
			const repo = {
				find_profile_by_user_id: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue({ id: 9 }),
				find_job_application_by_id: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue({ id: 1, company_send_status: 'Pending' }),
				update_job_application_status: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue({ ok: 1 }),
			} as any;
			(svc as any).companyRepository = repo;
			await expect(svc.update_job_application_status(1, 2, 'Pending')).rejects.toThrow('Job application is already Pending');
			await expect(svc.update_job_application_status(1, 2, 'Invalid' as any)).rejects.toThrow('Invalid job application status');
			const out = await svc.update_job_application_status(1, 2, 'Confirmed' as any);
			expect(out).toEqual({ ok: 1 });
			expect(repo.update_job_application_status).toHaveBeenCalledWith(2, 'Confirmed');
		});

		it('send_the_confirmation_to_employee validates profile and application then proxies', async () => {
			const svc = makeSvc();
						(svc as any).companyRepository = {
								find_profile_by_user_id: jest
									.fn<(...args: any[]) => Promise<any>>()
									.mockResolvedValueOnce(null)
									.mockResolvedValueOnce({ id: 3 })
									.mockResolvedValue({ id: 3 }),
								find_job_application_by_id: jest
									.fn<(...args: any[]) => Promise<any>>()
									.mockResolvedValueOnce(null)
									.mockResolvedValueOnce({ id: 10 }),
								send_the_confirmation_to_employee: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue({ id: 77 }),
						} as any;
			await expect(svc.send_the_confirmation_to_employee(1, 2)).rejects.toThrow('Company profile not found');
			await expect(svc.send_the_confirmation_to_employee(1, 2)).rejects.toThrow('Job application not found');
			const out = await svc.send_the_confirmation_to_employee(1, 2);
			expect(out).toEqual({ id: 77 });
		});
	});
});

