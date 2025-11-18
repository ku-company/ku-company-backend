/**
 * Jest unit tests for EmployeeService.
 * We stub EmployeeRepository and S3Service on the service instance and mock validatePdfBuffer.
 */

import { jest } from '@jest/globals';

// Mock validatePdfBuffer from helper/pdf.js for upload_resumes
const mockValidatePdfBuffer = jest
	.fn<(...args: any[]) => Promise<{ mime: string }>>()
	.mockResolvedValue({ mime: 'application/pdf' });
jest.unstable_mockModule('../../helper/pdf.js', () => ({
	validatePdfBuffer: mockValidatePdfBuffer,
}));

let EmployeeService: any;
beforeAll(async () => {
	const mod: any = await import('../../service/employeeService.js');
	EmployeeService = mod.EmployeeService;
});

const setEnv = (k: string, v: string) => {
	process.env[k] = v;
};

describe('EmployeeService', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		setEnv('RESUME_BUCKET_NAME', 'resume-bucket');
	});

	const makeSvc = () => new EmployeeService();

	describe('profile basics', () => {
		it('has_profile returns profile or throws', async () => {
			const svc = makeSvc();
			(svc as any).employeeRepository = {
				get_profile: jest.fn<() => Promise<any>>()
					.mockResolvedValueOnce({ id: 11 })
					.mockResolvedValueOnce(null),
			};
			await expect(svc.has_profile(1)).resolves.toEqual({ id: 11 });
			await expect(svc.has_profile(1)).rejects.toThrow('Profile not found');
		});

		it('create_profile throws when already exists, else creates', async () => {
			const svc = makeSvc();
			const repo = {
				get_profile: jest
					.fn<() => Promise<any>>()
					.mockResolvedValueOnce({ id: 10 })
					.mockResolvedValueOnce(null),
				create_profile: jest.fn<() => Promise<any>>().mockResolvedValue({ id: 99 }),
			};
			(svc as any).employeeRepository = repo;

			await expect(svc.create_profile({ user: { id: 1 } })).rejects.toThrow('Profile already exists');
			const out = await svc.create_profile({ user: { id: 1 } });
			expect(out).toEqual({ id: 99 });
			expect(repo.create_profile).toHaveBeenCalled();
		});
	});

	describe('upload_resumes', () => {
		it('throws when no files', async () => {
			const svc = makeSvc();
			(svc as any).employeeRepository = {
				get_profile: jest.fn<() => Promise<any>>().mockResolvedValue({ id: 5 }),
			};
			await expect(svc.upload_resumes({ user: { id: 1 }, files: [] }, { id: 1, role: 'Student' })).rejects.toThrow(
				'No resume files uploaded'
			);
		});

		it('enforces resume limit with clear message', async () => {
			const svc = makeSvc();
			(svc as any).employeeRepository = {
				get_profile: jest.fn<() => Promise<any>>().mockResolvedValue({ id: 5 }),
				resume_count: jest.fn<() => Promise<number>>().mockResolvedValue(2),
			};
			const files = [
				{ originalname: 'a.pdf', buffer: Buffer.from('a') },
				{ originalname: 'b.pdf', buffer: Buffer.from('b') },
			];
			await expect(
				svc.upload_resumes({ user: { id: 1 }, files }, { id: 1, role: 'Student' })
			).rejects.toThrow('You already have 2 resumes. You can upload only 1 more.');
		});

		it('uploads, stores, and returns keys', async () => {
			const svc = makeSvc();
			const repo = {
				get_profile: jest.fn<() => Promise<any>>().mockResolvedValue({ id: 7 }),
				resume_count: jest.fn<() => Promise<number>>().mockResolvedValue(1),
				upload_resume: jest.fn<() => Promise<void>>().mockResolvedValue(),
			};
			(svc as any).employeeRepository = repo;
			(svc as any).s3Service = {
				uploadFile: jest
					.fn<() => Promise<{ key: string }>>()
					.mockResolvedValueOnce({ key: 'resume/1.pdf' })
					.mockResolvedValueOnce({ key: 'resume/2.pdf' }),
			};
			const files = [
				{ originalname: 'a.pdf', buffer: Buffer.from('a') },
				{ originalname: 'b.pdf', buffer: Buffer.from('b') },
			];
			const keys = await svc.upload_resumes({ user: { id: 1 }, files }, { id: 1, role: 'Student' });
			expect(keys).toEqual(['resume/1.pdf', 'resume/2.pdf']);
			expect(repo.upload_resume).toHaveBeenCalledTimes(2);
		});
	});

	describe('resume retrieval and deletion', () => {
		it('get_all_resumes returns [] when none', async () => {
			const svc = makeSvc();
			(svc as any).employeeRepository = {
				get_profile: jest.fn<() => Promise<any>>().mockResolvedValue({ id: 3 }),
				get_resumes: jest.fn<() => Promise<any[]>>().mockResolvedValue([]),
				resume_count: jest.fn<() => Promise<number>>().mockResolvedValue(0),
			};
			const out = await svc.get_all_resumes(1);
			expect(out).toEqual([]);
		});

		it('get_all_resumes signs urls', async () => {
			const svc = makeSvc();
			(svc as any).employeeRepository = {
				get_profile: jest.fn<() => Promise<any>>().mockResolvedValue({ id: 3 }),
				get_resumes: jest
					.fn<() => Promise<any[]>>()
					.mockResolvedValue([{ id: 1, file_url: 'k1' }, { id: 2, file_url: 'k2' }]),
				resume_count: jest.fn<() => Promise<number>>().mockResolvedValue(2),
			};
			(svc as any).s3Service = {
				getFileUrl: jest
					.fn<() => Promise<string>>()
					.mockResolvedValueOnce('signed-1')
					.mockResolvedValueOnce('signed-2'),
			};
			const out = await svc.get_all_resumes(1);
			expect(out.map((r: any) => r.file_url)).toEqual(['signed-1', 'signed-2']);
		});

		it('get_resume signs and returns, or throws if not found', async () => {
			const svc = makeSvc();
			(svc as any).employeeRepository = {
				get_profile: jest.fn<() => Promise<any>>().mockResolvedValue({ id: 2 }),
				get_resume_by_id: jest
					.fn<() => Promise<any>>()
					.mockResolvedValueOnce(null)
					.mockResolvedValueOnce({ id: 9, file_url: 'k9' }),
			};
			(svc as any).s3Service = { getFileUrl: jest.fn<() => Promise<string>>().mockResolvedValue('signed-9') };
			await expect(svc.get_resume(9, 1)).rejects.toThrow('Resume not found');
			const res = await svc.get_resume(9, 1);
			expect(res.file_url).toBe('signed-9');
		});

		it('delete_resume deletes from s3 and db', async () => {
			const svc = makeSvc();
			const repo = {
				get_profile: jest.fn<() => Promise<any>>().mockResolvedValue({ id: 2 }),
				get_resume_by_id: jest.fn<() => Promise<any>>().mockResolvedValue({ id: 9, file_url: 'k9' }),
				delete_resume_by_id: jest.fn<() => Promise<void>>().mockResolvedValue(),
			};
			(svc as any).employeeRepository = repo;
			(svc as any).s3Service = { deleteFile: jest.fn<() => Promise<void>>().mockResolvedValue() };
			const out = await svc.delete_resume(9, 1);
			expect((svc as any).s3Service.deleteFile).toHaveBeenCalledWith('k9');
			expect(repo.delete_resume_by_id).toHaveBeenCalledWith(9, 2); // profile.id is 2
			expect(out).toEqual({ message: 'Resume deleted successfully' });
		});

		it('delete_all_resumes throws when none, else deletes all', async () => {
			const svc = makeSvc();
			const repo = {
				get_profile: jest.fn<() => Promise<any>>().mockResolvedValue({ id: 2 }),
				get_resumes: jest
					.fn<() => Promise<any[]>>()
					.mockResolvedValueOnce([])
					.mockResolvedValueOnce([{ id: 1, file_url: 'k1' }, { id: 2, file_url: 'k2' }]),
				delete_resumes_by_profile_id: jest.fn<() => Promise<void>>().mockResolvedValue(),
			};
			(svc as any).employeeRepository = repo;
			(svc as any).s3Service = { deleteFile: jest.fn<() => Promise<void>>().mockResolvedValue() };

			await expect(svc.delete_all_resumes(1)).rejects.toThrow('No resumes to delete');

			const out = await svc.delete_all_resumes(1);
			expect((svc as any).s3Service.deleteFile).toHaveBeenCalledTimes(2);
			expect(repo.delete_resumes_by_profile_id).toHaveBeenCalledWith(2);
			expect(out).toEqual({ message: 'All resumes deleted successfully' });
		});
	});

	describe('main resume and applications', () => {
		it('set_main_resume unsets existing if different, then sets new', async () => {
			const svc = makeSvc();
			const repo = {
				get_profile: jest.fn<() => Promise<any>>().mockResolvedValue({ id: 4 }),
				get_resume_by_id: jest.fn<() => Promise<any>>().mockResolvedValue({ id: 8, file_url: 'k8' }),
				find_main_resume: jest.fn<() => Promise<any>>().mockResolvedValue({ id: 7 }),
				unset_main_resume: jest.fn<() => Promise<void>>().mockResolvedValue(),
				set_main_resume: jest.fn<() => Promise<any>>().mockResolvedValue({ id: 8, is_main: true }),
			};
			(svc as any).employeeRepository = repo;
			const res = await svc.set_main_resume(8, 1);
			expect(repo.unset_main_resume).toHaveBeenCalledWith(7, 4);
			expect(repo.set_main_resume).toHaveBeenCalledWith(8, 4);
			expect(res).toEqual({ id: 8, is_main: true });
		});

		it('get_main_resume signs url or throws if none', async () => {
			const svc = makeSvc();
			const repo = {
				get_profile: jest.fn<() => Promise<any>>().mockResolvedValue({ id: 6 }),
				find_main_resume: jest
					.fn<() => Promise<any>>()
					.mockResolvedValueOnce(null)
					.mockResolvedValueOnce({ id: 2, file_url: 'k2' }),
			};
			(svc as any).employeeRepository = repo;
			(svc as any).s3Service = { getFileUrl: jest.fn<() => Promise<string>>().mockResolvedValue('signed-main') };
			await expect(svc.get_main_resume(1)).rejects.toThrow('No main resume set');
			const out = await svc.get_main_resume(1);
			expect(out.file_url).toBe('signed-main');
		});

		it('apply_to_individual_job forwards with numeric id', async () => {
			const svc = makeSvc();
			const repo = { apply_to_individual_job: jest.fn<() => Promise<any>>().mockResolvedValue('ok') };
			(svc as any).employeeRepository = repo;
			const res = await svc.apply_to_individual_job(123 as any, 10, 5);
			expect(repo.apply_to_individual_job).toHaveBeenCalledWith(123, 10, 5);
			expect(res).toBe('ok');
		});
	});
});

