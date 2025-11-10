/**
 * Repository tests for ProfessorRepository
 * We inject a mocked Prisma client into the repository instance to avoid real DB calls.
 */

import { jest } from '@jest/globals';
import { ProfessorRepository } from '../../repository/professorRepository.js';

// Minimal mock Prisma with only the methods we exercise
const mockPrisma: any = {
	professorProfile: {
		findUnique: jest.fn(),
		create: jest.fn(),
		delete: jest.fn(),
		update: jest.fn(),
	},
	user: {
		update: jest.fn(),
	},
	announcement: {
		create: jest.fn(),
		findFirst: jest.fn(),
		findUnique: jest.fn(),
		update: jest.fn(),
		delete: jest.fn(),
		findMany: jest.fn(),
	},
	employeeProfile: {
		findMany: jest.fn(),
	},
	notification: {
		create: jest.fn(),
	},
	comment: {
		create: jest.fn(),
		findUnique: jest.fn(),
		update: jest.fn(),
		delete: jest.fn(),
	},
	companyProfile: {
		findUnique: jest.fn(),
	},
};

beforeEach(() => {
	jest.clearAllMocks();
});

const makeRepo = () => {
	const repo = new ProfessorRepository();
	(repo as any).prisma = mockPrisma;
	return repo;
};

describe('ProfessorRepository - profile CRUD', () => {
	it('create_profile throws if exists, else creates', async () => {
		const repo = makeRepo();
		mockPrisma.professorProfile.findUnique.mockResolvedValueOnce({ id: 1 });
		await expect(repo.create_profile(10 as any, { department: 'CS' } as any)).rejects.toThrow(
			'Profile already exists'
		);
		expect(mockPrisma.professorProfile.create).not.toHaveBeenCalled();

		mockPrisma.professorProfile.findUnique.mockResolvedValueOnce(null);
		const sample = { id: 2 };
		mockPrisma.professorProfile.create.mockResolvedValueOnce(sample);
		const out = await repo.create_profile(11 as any, { department: 'IT' } as any);
		expect(out).toBe(sample);
		expect(mockPrisma.professorProfile.create).toHaveBeenCalledWith({
			data: expect.objectContaining({
				department: 'IT',
				user: { connect: { id: 11 } },
			}),
		});
	});

	it('get_profile returns include user fields', async () => {
		const repo = makeRepo();
		mockPrisma.professorProfile.findUnique.mockResolvedValueOnce({ id: 3 });
		const out = await repo.get_profile(77);
		expect(out).toEqual({ id: 3 });
		expect(mockPrisma.professorProfile.findUnique).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { user_id: 77 },
				include: expect.objectContaining({
					user: {
						select: {
							first_name: true,
							last_name: true,
							email: true,
							profile_image: true,
							verified: true,
						},
					},
					degrees: true,
				}),
			})
		);
	});

	it('delete_profile deletes by user_id', async () => {
		const repo = makeRepo();
		mockPrisma.professorProfile.delete.mockResolvedValueOnce({ id: 4 });
		const out = await repo.delete_profile(88);
		expect(out).toEqual({ id: 4 });
		expect(mockPrisma.professorProfile.delete).toHaveBeenCalledWith({ where: { user_id: 88 } });
	});

	it('edit_profile success updates user and profile; failure throws "Profile not found"', async () => {
		const repo = makeRepo();
		// success
		const sample = { id: 5, user: { first_name: 'A' } };
		mockPrisma.user.update.mockResolvedValueOnce({});
		mockPrisma.professorProfile.update.mockResolvedValueOnce(sample);
		const ok = await repo.edit_profile(1, {
			first_name: 'A',
			last_name: 'B',
			department: 'CS',
			faculty: 'ENG',
		} as any);
		expect(ok).toBe(sample);
		expect(mockPrisma.user.update).toHaveBeenCalledWith({
			where: { id: 1 },
			data: { first_name: 'A', last_name: 'B' },
		});
		expect(mockPrisma.professorProfile.update).toHaveBeenCalledWith({
			where: { user_id: 1 },
			data: expect.objectContaining({ department: 'CS', faculty: 'ENG', updated_at: expect.any(Date) }),
			include: expect.objectContaining({
				user: {
					select: expect.any(Object),
				},
				degrees: true,
			}),
		});

		// failure path via thrown error
		mockPrisma.user.update.mockRejectedValueOnce(new Error('boom'));
		await expect(
			repo.edit_profile(2, { first_name: 'X', last_name: 'Y' } as any)
		).rejects.toThrow('Profile not found');
	});
});

describe('ProfessorRepository - repost lookup and notifications', () => {
	it('get_repost_by_job_id proxies to prisma.announcement.findFirst', async () => {
		const repo = makeRepo();
		mockPrisma.announcement.findFirst.mockResolvedValueOnce({ id: 9 });
		const out = await repo.get_repost_by_job_id(12, 34);
		expect(out).toEqual({ id: 9 });
		expect(mockPrisma.announcement.findFirst).toHaveBeenCalledWith({
			where: { professor_id: 12, job_id: 34 },
		});
	});

	it('sent_announcement_notification_to_employees sends a notification to each student with proper message', async () => {
		const repo = makeRepo();
		mockPrisma.professorProfile.findUnique.mockResolvedValueOnce({ user: { first_name: 'John', last_name: 'Doe' } });
		mockPrisma.employeeProfile.findMany.mockResolvedValueOnce([{ id: 10 }, { id: 11 }]);
		mockPrisma.notification.create.mockResolvedValue({});
		const content = 'A'.repeat(60);
		await repo.sent_announcement_notification_to_employees(5, 101, content);
		expect(mockPrisma.notification.create).toHaveBeenCalledTimes(2);
		const msg = `New announcement from Professor John D: ${'A'.repeat(50)}...`;
		expect(mockPrisma.notification.create).toHaveBeenNthCalledWith(1, {
			data: expect.objectContaining({
				employee_id: 10,
				professor_id: 5,
				announcement_id: 101,
				message: msg,
				notification_status: 'Unread',
				notification_type: 'NewAnnouncement',
			}),
		});
	});
});

describe('ProfessorRepository - create_post', () => {
	it('creates announcement and throws when content missing (after create), does not send notifications', async () => {
		const repo = makeRepo();
		// Patch method to detect calls
			const spyNotify = jest
				.spyOn(repo as any, 'sent_announcement_notification_to_employees')
				.mockResolvedValue(undefined as any);
		mockPrisma.announcement.create.mockResolvedValueOnce({ id: 200 });
		await expect(
			repo.create_post(7, { type_post: 'Announcement', content: '', is_connection: false } as any)
		).rejects.toThrow('Content is required for announcements');
		expect(mockPrisma.announcement.create).toHaveBeenCalled();
		expect(spyNotify).not.toHaveBeenCalled();
	});

	it('creates announcement with content and sends notifications', async () => {
		const repo = makeRepo();
			const spyNotify = jest
				.spyOn(repo as any, 'sent_announcement_notification_to_employees')
				.mockResolvedValue(undefined as any);
		const sample = { id: 201, job_post: null };
		mockPrisma.announcement.create.mockResolvedValueOnce(sample);
		const out = await repo.create_post(8, { type_post: 'Announcement', content: 'Hello', is_connection: true } as any);
		expect(out).toBe(sample);
		expect(mockPrisma.announcement.create).toHaveBeenCalledWith({
			data: expect.objectContaining({
				professor_id: 8,
				content: 'Hello',
				is_connection: true,
				type_post: 'Announcement',
			}),
			include: { job_post: true },
		});
		expect(spyNotify).toHaveBeenCalledWith(8, 201, 'Hello');
	});

	it('creates opinion without sending notifications', async () => {
		const repo = makeRepo();
			const spyNotify = jest
				.spyOn(repo as any, 'sent_announcement_notification_to_employees')
				.mockResolvedValue(undefined as any);
		const sample = { id: 202 };
		mockPrisma.announcement.create.mockResolvedValueOnce(sample);
		const out = await repo.create_post(9, { type_post: 'Opinion', content: 'Thoughts', is_connection: false } as any);
		expect(out).toBe(sample);
		expect(spyNotify).not.toHaveBeenCalled();
	});

	it('creates repost with job_id in payload', async () => {
		const repo = makeRepo();
		mockPrisma.announcement.create.mockResolvedValueOnce({ id: 203 });
		await repo.create_post(9, { type_post: 'Repost', job_id: 55 } as any);
		const args = mockPrisma.announcement.create.mock.calls[0][0];
		expect(args.data).toMatchObject({ professor_id: 9, job_id: 55, type_post: 'Repost' });
	});
});

describe('ProfessorRepository - edit/delete/get posts', () => {
	it('edit_post throws when not found or unauthorized, else updates', async () => {
		const repo = makeRepo();
		// not found
		mockPrisma.announcement.findFirst.mockResolvedValueOnce(null);
		await expect(
			repo.edit_post(1, 2, { type_post: 'Announcement', content: 'X' } as any)
		).rejects.toThrow('Post not found');

		// unauthorized
		mockPrisma.announcement.findFirst.mockResolvedValueOnce({ professor_id: 99 });
		await expect(
			repo.edit_post(1, 2, { type_post: 'Opinion', content: 'Y' } as any)
		).rejects.toThrow('Unauthorized to edit this post');

		// success
		mockPrisma.announcement.findFirst.mockResolvedValueOnce({ professor_id: 2 });
		const sample = { id: 10 };
		mockPrisma.announcement.update.mockResolvedValueOnce(sample);
		const out = await repo.edit_post(1, 2, { type_post: 'Opinion', content: 'Z' } as any);
		expect(out).toBe(sample);
		expect(mockPrisma.announcement.update).toHaveBeenCalledWith({
			where: { id: 1 },
			data: expect.objectContaining({ type_post: 'Opinion', content: 'Z' }),
		});
	});

	it('delete_post throws when not found or unauthorized, else deletes', async () => {
		const repo = makeRepo();
		mockPrisma.announcement.findUnique.mockResolvedValueOnce(null);
		await expect(repo.delete_post(1, 2)).rejects.toThrow('Post not found');

		mockPrisma.announcement.findUnique.mockResolvedValueOnce({ professor_id: 99 });
		await expect(repo.delete_post(1, 2)).rejects.toThrow('Unauthorized to delete this post');

		mockPrisma.announcement.findUnique.mockResolvedValueOnce({ professor_id: 2 });
		mockPrisma.announcement.delete.mockResolvedValueOnce({ id: 2 });
		const out = await repo.delete_post(1, 2);
		expect(out).toEqual({ id: 2 });
		expect(mockPrisma.announcement.delete).toHaveBeenCalledWith({ where: { id: 1 } });
	});

	it('get_post_by_id returns matching post with include', async () => {
		const repo = makeRepo();
		const sample = { id: 30 };
		mockPrisma.announcement.findFirst.mockResolvedValueOnce(sample);
		const out = await repo.get_post_by_id(3, 4);
		expect(out).toBe(sample);
		expect(mockPrisma.announcement.findFirst).toHaveBeenCalledWith({
			where: { id: 3, professor_id: 4 },
			include: { job_post: true },
		});
	});
});

describe('ProfessorRepository - comments', () => {
	it('add_comment_to_company validates existence and creates', async () => {
		const repo = makeRepo();
		mockPrisma.professorProfile.findUnique.mockResolvedValueOnce(null);
		await expect(repo.add_comment_to_company(1, 2, 'hi')).rejects.toThrow('Professor not found');

		mockPrisma.professorProfile.findUnique.mockResolvedValueOnce({ id: 9 });
		mockPrisma.companyProfile.findUnique.mockResolvedValueOnce(null);
		await expect(repo.add_comment_to_company(1, 2, 'hi')).rejects.toThrow('Company not found');

		mockPrisma.professorProfile.findUnique.mockResolvedValueOnce({ id: 9 });
		mockPrisma.companyProfile.findUnique.mockResolvedValueOnce({ id: 2 });
		const sample = { id: 10 };
		mockPrisma.comment.create.mockResolvedValueOnce(sample);
		const out = await repo.add_comment_to_company(1, 2, 'hello');
		expect(out).toBe(sample);
		expect(mockPrisma.comment.create).toHaveBeenCalledWith({
			data: expect.objectContaining({ user_id: 1, company_id: 2, content: 'hello', created_at: expect.any(Date) }),
			include: {
				user: { select: { first_name: true, last_name: true } },
				company: true,
			},
		});
	});

	it('edit_comment requires professor and existing comment, then updates', async () => {
		const repo = makeRepo();
		mockPrisma.professorProfile.findUnique.mockResolvedValueOnce(null);
		await expect(repo.edit_comment(1, 2, 'x')).rejects.toThrow('Professor not found');

		mockPrisma.professorProfile.findUnique.mockResolvedValueOnce({ id: 7 });
		mockPrisma.comment.findUnique.mockResolvedValueOnce(null);
		await expect(repo.edit_comment(1, 2, 'x')).rejects.toThrow('Comment not found');

		mockPrisma.professorProfile.findUnique.mockResolvedValueOnce({ id: 7 });
		mockPrisma.comment.findUnique.mockResolvedValueOnce({ id: 2 });
		const sample = { id: 2, content: 'y' };
		mockPrisma.comment.update.mockResolvedValueOnce(sample);
		const out = await repo.edit_comment(1, 2, 'y');
		expect(out).toBe(sample);
		expect(mockPrisma.comment.update).toHaveBeenCalledWith({
			where: { id: 2, user_id: 1 },
			data: { content: 'y', updated_at: expect.any(Date) },
			include: {
				user: { select: { first_name: true, last_name: true } },
				company: true,
			},
		});
	});

	it('delete_comment requires professor and existing comment, then deletes', async () => {
		const repo = makeRepo();
		mockPrisma.professorProfile.findUnique.mockResolvedValueOnce(null);
		await expect(repo.delete_comment(1, 2)).rejects.toThrow('Professor not found');

		mockPrisma.professorProfile.findUnique.mockResolvedValueOnce({ id: 7 });
		mockPrisma.comment.findUnique.mockResolvedValueOnce(null);
		await expect(repo.delete_comment(1, 2)).rejects.toThrow('Comment not found');

		mockPrisma.professorProfile.findUnique.mockResolvedValueOnce({ id: 7 });
		mockPrisma.comment.findUnique.mockResolvedValueOnce({ id: 2 });
		mockPrisma.comment.delete.mockResolvedValueOnce({ id: 2 });
		const out = await repo.delete_comment(1, 2);
		expect(out).toEqual({ id: 2 });
		expect(mockPrisma.comment.delete).toHaveBeenCalledWith({ where: { id: 2, user_id: 1 } });
	});
});

describe('ProfessorRepository - list queries', () => {
	it('get_all_repost_job filters and includes job_post', async () => {
		const repo = makeRepo();
		mockPrisma.announcement.findMany.mockResolvedValueOnce([{ id: 1 }]);
		const out = await repo.get_all_repost_job(5);
		expect(out).toEqual([{ id: 1 }]);
		expect(mockPrisma.announcement.findMany).toHaveBeenCalledWith({
			where: { professor_id: 5, type_post: 'Repost' },
			include: { job_post: true },
		});
	});

	it('get_all_announcement sorts desc', async () => {
		const repo = makeRepo();
		mockPrisma.announcement.findMany.mockResolvedValueOnce([{ id: 2 }]);
		const out = await repo.get_all_announcement(6);
		expect(out).toEqual([{ id: 2 }]);
		expect(mockPrisma.announcement.findMany).toHaveBeenCalledWith({
			where: { professor_id: 6, type_post: 'Announcement' },
			orderBy: { created_at: 'desc' },
		});
	});

	it('get_all_posts sorts desc and includes job_post', async () => {
		const repo = makeRepo();
		mockPrisma.announcement.findMany.mockResolvedValueOnce([{ id: 3 }]);
		const out = await repo.get_all_posts(7);
		expect(out).toEqual([{ id: 3 }]);
		expect(mockPrisma.announcement.findMany).toHaveBeenCalledWith({
			where: { professor_id: 7 },
			orderBy: { created_at: 'desc' },
			include: { job_post: true },
		});
	});

	it('get_all_opinions sorts desc', async () => {
		const repo = makeRepo();
		mockPrisma.announcement.findMany.mockResolvedValueOnce([{ id: 4 }]);
		const out = await repo.get_all_opinions(8);
		expect(out).toEqual([{ id: 4 }]);
		expect(mockPrisma.announcement.findMany).toHaveBeenCalledWith({
			where: { professor_id: 8, type_post: 'Opinion' },
			orderBy: { created_at: 'desc' },
		});
	});
});
