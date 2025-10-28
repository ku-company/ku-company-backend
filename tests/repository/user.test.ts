/**
 * Repository tests for UserRepository.create_user
 * We mock PrismaDB singleton to inject a fake Prisma client and assert calls.
 */

import { jest } from '@jest/globals';

// Create a shared mock prisma object we can reset between tests
const mockPrisma: any = {
	user: {
		create: jest.fn(),
	},
};

// Import repository and enums normally; we'll monkey-patch the prisma instance per test
import { UserRepository } from '../../repository/userRepository.js';
import { Role } from '../../utils/enums.js';

beforeEach(() => {
	jest.clearAllMocks();
});

describe('UserRepository.create_user', () => {
	it('creates Student with employeeProfile include when email is ku.th and stdId present', async () => {
		const repo = new UserRepository();
		const sample = { id: 1, role: Role.Student } as any;
		mockPrisma.user.create.mockResolvedValue(sample);
		(repo as any).prisma = mockPrisma;

			const input = {
			first_name: 'A',
			last_name: 'B',
			stdId: '123',
			user_name: 'ab',
			email: 'a@ku.th',
			password_hash: 'hash',
			role: Role.Student,
			profile_image: null,
		};

		const out = await repo.create_user(input as any);
		expect(out).toBe(sample);
		const args = mockPrisma.user.create.mock.calls[0][0];
		expect(args).toMatchObject({ include: { employeeProfile: true } });
		expect(args.data).toMatchObject({ stdId: '123', role: Role.Student });
		expect(args.data.employeeProfile).toEqual({ create: {} });
	});

	it('throws for Student/Alumni when stdId missing', async () => {
		const repo = new UserRepository();
			const input = {
			first_name: 'A',
			last_name: 'B',
			email: 'a@ku.th',
			password_hash: 'hash',
			role: Role.Student,
		};
		await expect(repo.create_user(input as any)).rejects.toThrow(
			'StudentId is required for Student and Alumni roles'
		);
		expect(mockPrisma.user.create).not.toHaveBeenCalled();
	});

	it('throws for Student/Alumni when email is not ku.th', async () => {
		const repo = new UserRepository();
		const input = {
			first_name: 'A',
			last_name: 'B',
			stdId: '123',
			email: 'a@example.com',
			password_hash: 'hash',
			role: Role.Alumni,
		};
		await expect(repo.create_user(input as any)).rejects.toThrow(
			'Email must be a valid ku.th email address'
		);
		expect(mockPrisma.user.create).not.toHaveBeenCalled();
	});

	it('creates Professor when email ends with ku.th', async () => {
		const repo = new UserRepository();
		const sample = { id: 2, role: Role.Professor } as any;
		mockPrisma.user.create.mockResolvedValue(sample);
		(repo as any).prisma = mockPrisma;
		const input = {
			first_name: 'Prof',
			last_name: 'X',
			email: 'teach@ku.th',
			password_hash: 'hash',
			role: Role.Professor,
		};
		const out = await repo.create_user(input as any);
		expect(out).toBe(sample);
		const args = mockPrisma.user.create.mock.calls[0][0];
		expect(args.data).toMatchObject({ role: Role.Professor, email: 'teach@ku.th' });
		expect(args.include).toBeUndefined();
	});

	it('throws for Professor when email is not ku.th or ku.ac.th', async () => {
		const repo = new UserRepository();
		const input = {
			first_name: 'Prof',
			last_name: 'X',
			email: 'prof@gmail.com',
			password_hash: 'hash',
			role: Role.Professor,
		};
		await expect(repo.create_user(input as any)).rejects.toThrow(
			'Email must be a valid ku.th or ku.ac.th email address'
		);
		expect(mockPrisma.user.create).not.toHaveBeenCalled();
	});

	it('creates Admin with verified true and Approved status', async () => {
		const repo = new UserRepository();
		const sample = { id: 3, role: Role.Admin } as any;
		mockPrisma.user.create.mockResolvedValue(sample);
		(repo as any).prisma = mockPrisma;
		const input = {
			first_name: 'Admin',
			last_name: 'Y',
			company_name: 'KUC',
			email: 'admin@example.com',
			password_hash: 'hash',
			role: Role.Admin,
		};
		const out = await repo.create_user(input as any);
		expect(out).toBe(sample);
		const args = mockPrisma.user.create.mock.calls[0][0];
		expect(args.data).toMatchObject({ role: Role.Admin, verified: true, status: 'Approved' });
	});

	it('creates Company (or other) with Pending status and verified false', async () => {
		const repo = new UserRepository();
		const sample = { id: 4, role: Role.Company } as any;
		mockPrisma.user.create.mockResolvedValue(sample);
		(repo as any).prisma = mockPrisma;
		const input = {
			first_name: 'Comp',
			last_name: 'Z',
			company_name: 'ACME',
			email: 'hr@acme.com',
			password_hash: 'hash',
			role: Role.Company,
		};
		const out = await repo.create_user(input as any);
		expect(out).toBe(sample);
		const args = mockPrisma.user.create.mock.calls[0][0];
		expect(args.data).toMatchObject({ role: Role.Company, verified: false, status: 'Pending' });
	});
});

