/**
 * Repository tests for CompanyRepository using a mocked Prisma client.
 */

import { jest } from '@jest/globals';
import { CompanyRepository } from '../../repository/companyRepository.js';

const mockPrisma: any = {
	companyProfile: {
		create: jest.fn<(...args: any[]) => any>(),
		findUnique: jest.fn<(...args: any[]) => any>(),
		update: jest.fn<(...args: any[]) => any>(),
	},
	user: {
		update: jest.fn<(...args: any[]) => any>(),
	},
	jobPost: {
		create: jest.fn<(...args: any[]) => any>(),
		findMany: jest.fn<(...args: any[]) => any>(),
		findUnique: jest.fn<(...args: any[]) => any>(),
		update: jest.fn<(...args: any[]) => any>(),
		delete: jest.fn<(...args: any[]) => any>(),
	},
	jobApplication: {
		findMany: jest.fn<(...args: any[]) => any>(),
		findFirst: jest.fn<(...args: any[]) => any>(),
		findUnique: jest.fn<(...args: any[]) => any>(),
		update: jest.fn<(...args: any[]) => any>(),
	},
	notification: {
		create: jest.fn<(...args: any[]) => any>(),
	},
};

const makeRepo = () => {
	const repo = new CompanyRepository();
	(repo as any).prisma = mockPrisma;
	return repo;
};

beforeEach(() => {
	jest.clearAllMocks();
});

describe('CompanyRepository - company profile', () => {
	it('create_company_profile creates profile and updates user name when provided', async () => {
		const repo = makeRepo();
		mockPrisma.companyProfile.create.mockResolvedValue({ id: 1 });
		const input = { user_id: 10, company_name: 'NewCo', description: 'D' } as any;
		const out = await repo.create_company_profile(input);
		expect(out).toEqual({ id: 1 });
		expect(mockPrisma.companyProfile.create).toHaveBeenCalledWith({ data: { ...input } });
		expect(mockPrisma.user.update).toHaveBeenCalledWith({ where: { id: 10 }, data: { company_name: 'NewCo' } });
	});

	it('create_company_profile does not update user name when not provided', async () => {
		const repo = makeRepo();
		mockPrisma.companyProfile.create.mockResolvedValue({ id: 2 });
		const input = { user_id: 11, description: 'D' } as any;
		const out = await repo.create_company_profile(input);
		expect(out).toEqual({ id: 2 });
		expect(mockPrisma.user.update).not.toHaveBeenCalled();
	});

	it('find_profile_by_user_id includes comments sorted desc', async () => {
		const repo = makeRepo();
		mockPrisma.companyProfile.findUnique.mockResolvedValue({ id: 3 });
		const out = await repo.find_profile_by_user_id(77);
		expect(out).toEqual({ id: 3 });
		expect(mockPrisma.companyProfile.findUnique).toHaveBeenCalledWith({
			where: { user_id: 77 },
			include: { comments: { orderBy: { created_at: 'desc' } } },
		});
	});

	it('update_company_name proxies to prisma.user.update', async () => {
		const repo = makeRepo();
		await repo.update_company_name(55, 'Acme');
		expect(mockPrisma.user.update).toHaveBeenCalledWith({ where: { id: 55 }, data: { company_name: 'Acme' } });
	});

	it('update_company_profile updates profile and user name when provided', async () => {
		const repo = makeRepo();
		mockPrisma.companyProfile.update.mockResolvedValue({ id: 4 });
		const input = { user_id: 66, company_name: 'Acme2', description: 'E' } as any;
		const out = await repo.update_company_profile(66, input);
		expect(out).toEqual({ id: 4 });
		expect(mockPrisma.user.update).toHaveBeenCalledWith({ where: { id: 66 }, data: { company_name: 'Acme2' } });
		expect(mockPrisma.companyProfile.update).toHaveBeenCalledWith({ where: { user_id: 66 }, data: { ...input } });
	});
});

describe('CompanyRepository - job postings', () => {
	it('create_job_posting maps fields correctly', async () => {
		const repo = makeRepo();
		mockPrisma.jobPost.create.mockResolvedValue({ id: 9 });
		const out = await repo.create_job_posting({
			company_id: 1,
			description: 'desc',
			jobType: 'FullTime',
			position: 'Backend_Developer',
			available_position: 2,
		} as any);
		expect(out).toEqual({ id: 9 });
			expect(mockPrisma.jobPost.create).toHaveBeenCalledWith({
				data: expect.objectContaining({
					description: 'desc',
					jobType: 'FullTime',
					position: 'Backend_Developer',
					available_position: 2,
					company_id: 1,
				}),
			});
	});

	it('find_today_job_postings uses date window', async () => {
		const repo = makeRepo();
		mockPrisma.jobPost.findMany.mockResolvedValue([]);
		const today = new Date('2025-10-26T00:00:00.000Z');
		await repo.find_today_job_postings(5, today);
		const args = mockPrisma.jobPost.findMany.mock.calls[0][0];
		expect(args.where.company_id).toBe(5);
		expect(new Date(args.where.created_at.gte).getTime()).toBe(today.getTime());
		const expectedLt = new Date(today.getTime() + 24 * 60 * 60 * 1000).getTime();
		expect(new Date(args.where.created_at.lt).getTime()).toBe(expectedLt);
	});

	it('find_job_posting_by_id / find_all_job_postings_by_company_id', async () => {
		const repo = makeRepo();
		mockPrisma.jobPost.findUnique.mockResolvedValue({ id: 1 });
		await repo.find_job_posting_by_id(1);
		expect(mockPrisma.jobPost.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });

		mockPrisma.jobPost.findMany.mockResolvedValue([{ id: 2 }]);
		const list = await repo.find_all_job_postings_by_company_id(7);
		expect(list).toEqual([{ id: 2 }]);
		expect(mockPrisma.jobPost.findMany).toHaveBeenCalledWith({
			where: { company_id: 7 },
			orderBy: { created_at: 'desc' },
		});
	});

	it('update_job_posting and delete_job_posting', async () => {
		const repo = makeRepo();
		mockPrisma.jobPost.update.mockResolvedValue({ id: 3 });
		const up = await repo.update_job_posting(3, {
			description: 'd',
			jobType: 'Internship',
			position: 'Frontend_Developer',
			available_position: 5,
		} as any);
		expect(up).toEqual({ id: 3 });
		expect(mockPrisma.jobPost.update).toHaveBeenCalledWith({
			where: { id: 3 },
			data: expect.objectContaining({ description: 'd', jobType: 'Internship', position: 'Frontend_Developer', available_position: 5 }),
		});

		mockPrisma.jobPost.delete.mockResolvedValue({ id: 3 });
		const del = await repo.delete_job_posting(3);
		expect(del).toEqual({ id: 3 });
		expect(mockPrisma.jobPost.delete).toHaveBeenCalledWith({ where: { id: 3 } });
	});
});

describe('CompanyRepository - applications', () => {
	it('find_all_job_applications_by_company_id transforms and sorts', async () => {
		const repo = makeRepo();
		const apps = [
			{
				id: 1,
				batch_id: null,
				job_id: 10,
				job_post: { description: 'Desc A', jobType: 'FullTime', position: 'Backend_Developer' },
				employee: { user: { first_name: 'John', last_name: 'Doe', email: 'j@d.com' } },
				resume: { id: 50, file_url: 'k1' },
				company_send_status: 'Pending',
				employee_send_status: 'Pending',
				applied_at: new Date('2025-01-01T00:00:00Z'),
			},
			{
				id: 2,
				batch_id: 5,
				job_id: 11,
				job_post: { description: 'Desc B', jobType: 'Internship', position: 'Frontend_Developer' },
				employee: { user: { first_name: 'Ann', last_name: 'Lee', email: 'a@l.com' } },
				resume: { id: 51, file_url: 'k2' },
				company_send_status: 'Confirmed',
				employee_send_status: 'Pending',
				applied_at: new Date('2025-01-02T00:00:00Z'),
			},
		];
		mockPrisma.jobApplication.findMany.mockResolvedValue(apps as any);
		const filters = { job_post: { company_id: 9 } };
		const out = await repo.find_all_job_applications_by_company_id(filters, 'position', 'asc');
			expect(mockPrisma.jobApplication.findMany).toHaveBeenCalledWith({
			where: filters,
			include: {
				job_post: { select: { position: true, description: true, jobType: true } },
					employee: { include: { user: { select: expect.objectContaining({ first_name: true, last_name: true, email: true, id: true }) } } },
				resume: { select: { id: true, file_url: true } },
			},
			orderBy: { job_post: { position: 'asc' } },
		});
		expect(out[0]).toMatchObject({
			id: 1,
			description: 'Desc A',
			jobType: 'FullTime',
			position: 'Backend_Developer',
			name: 'John Doe',
			email: 'j@d.com',
			resume_url: 'k1',
		});
	});

	it('find_job_application_by_id returns null when not found, else transformed', async () => {
		const repo = makeRepo();
		mockPrisma.jobApplication.findFirst.mockResolvedValueOnce(null);
		const none = await repo.find_job_application_by_id(7, 2);
		expect(none).toBeNull();
		expect(mockPrisma.jobApplication.findFirst).toHaveBeenCalledWith({
			where: { id: 2, job_post: { company_id: 7 } },
			include: {
				job_post: { select: { position: true, description: true, jobType: true } },
				employee: { include: { user: { select: { first_name: true, last_name: true, email: true } } } },
				resume: { select: { id: true, file_url: true } },
			},
		});

		const app = {
			id: 3,
			job_id: 12,
			job_post: { description: 'Desc C', jobType: 'Contract', position: 'Fullstack_Developer' },
			employee: { user: { first_name: 'Bob', last_name: 'A', email: 'b@a.com' } },
			resume: { id: 60, file_url: 'k3' },
			company_send_status: 'Pending',
			employee_send_status: 'Pending',
			applied_at: new Date('2025-01-03T00:00:00Z'),
		} as any;
		mockPrisma.jobApplication.findFirst.mockResolvedValueOnce(app);
		const got = await repo.find_job_application_by_id(7, 3);
		expect(got).toMatchObject({ id: 3, description: 'Desc C', jobType: 'Contract', position: 'Fullstack_Developer', name: 'Bob A', email: 'b@a.com', resume_url: 'k3' });
	});

	it('update_job_application_status rejects invalid and updates valid', async () => {
		const repo = makeRepo();
		await expect(repo.update_job_application_status(1, 'Invalid' as any)).rejects.toThrow('Invalid job application status');
		mockPrisma.jobApplication.update.mockResolvedValue({ id: 5 });
		const ok = await repo.update_job_application_status(2, 'Confirmed' as any);
		expect(ok).toEqual({ id: 5 });
		expect(mockPrisma.jobApplication.update).toHaveBeenCalledWith({
			where: { id: 2 },
			data: { company_send_status: 'Confirmed' },
		});
	});

	it('send_the_confirmation_to_employee error cases and success', async () => {
		const repo = makeRepo();
		// app not found
		mockPrisma.companyProfile.findUnique.mockResolvedValue({ id: 10 });
		mockPrisma.jobApplication.findUnique.mockResolvedValueOnce(null);
		await expect(repo.send_the_confirmation_to_employee(1, 2)).rejects.toThrow('Job application not found');

		// company not found
		mockPrisma.companyProfile.findUnique.mockResolvedValueOnce(null);
		mockPrisma.jobApplication.findUnique.mockResolvedValueOnce({ id: 1, employee_id: 99 });
		await expect(repo.send_the_confirmation_to_employee(1, 2)).rejects.toThrow('Company profile not found');

		// success
		mockPrisma.companyProfile.findUnique.mockResolvedValueOnce({ id: 10 });
		mockPrisma.jobApplication.findUnique.mockResolvedValueOnce({ id: 1, employee_id: 99 });
		mockPrisma.jobApplication.update.mockResolvedValue({});
		const notification = { id: 77 };
		mockPrisma.notification.create.mockResolvedValue(notification);
		const out = await repo.send_the_confirmation_to_employee(1, 2);
		expect(out).toBe(notification);
		expect(mockPrisma.jobApplication.update).toHaveBeenCalledWith({
			where: { id: 1 },
			data: { company_send_status: 'Confirmed', company_responded_at: expect.any(Date) },
		});
		expect(mockPrisma.notification.create).toHaveBeenCalledWith({
			data: expect.objectContaining({
				employee_id: 99,
				company_id: 10,
				application_id: 1,
				notification_status: 'Accepted',
				notification_type: 'ApplicationConfirmed',
			}),
			include: { application: true },
		});
	});
});

