/**
 * Unit tests for ProfessorService.
 * We mock ProfessorRepository and UserService by patching the instance fields on the service.
 */

import { jest } from '@jest/globals';

let ProfessorService: any;
let AnnouncementType: any;

beforeAll(async () => {
	const svcMod: any = await import('../../service/professorService.js');
	ProfessorService = svcMod.ProfessorService;
	const enumsMod: any = await import('../../utils/enums.js');
	AnnouncementType = enumsMod.AnnouncementType;
});

const makeSvc = () => new ProfessorService();

describe('ProfessorService', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('has_profile', () => {
		it('returns profile or throws', async () => {
			const svc = makeSvc();
			(svc as any).professorRepository = {
				get_profile: jest
					.fn<(...args: any[]) => Promise<any>>()
					.mockResolvedValueOnce({ id: 1 })
					.mockResolvedValueOnce(null),
			} as any;
			await expect(svc.has_profile(10)).resolves.toEqual({ id: 1 });
			await expect(svc.has_profile(10)).rejects.toThrow('Profile not found');
		});
	});

	describe('create_profile', () => {
		it('requires department and faculty', async () => {
			const svc = makeSvc();
			await expect(svc.create_profile({ user: { id: 1 } }, { department: '', faculty: 'F' } as any)).rejects.toThrow(
				'Department is required'
			);
			await expect(svc.create_profile({ user: { id: 1 } }, { department: 'D' } as any)).rejects.toThrow(
				'Faculty is required'
			);
		});

		it('creates profile via repository', async () => {
			const svc = makeSvc();
			(svc as any).professorRepository = {
				create_profile: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue({ ok: 1 }),
			} as any;
			const out = await svc.create_profile({ user: { id: 99 } }, { department: 'D', faculty: 'F' } as any);
			expect(out).toEqual({ ok: 1 });
			expect((svc as any).professorRepository.create_profile).toHaveBeenCalledWith(99, {
				department: 'D',
				faculty: 'F',
			});
		});
	});

	describe('get_profile and delete_profile', () => {
		it('get_profile attaches profile_image_url', async () => {
			const svc = makeSvc();
			(svc as any).professorRepository = {
				get_profile: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue({ id: 7 }),
			} as any;
			(svc as any).userService = {
				get_profile_image: jest.fn<(...args: any[]) => Promise<string>>().mockResolvedValue('signed-url'),
			} as any;
			const res = await svc.get_profile({ user: { id: 42 } });
			expect(res.profile_image_url).toBe('signed-url');
			expect((svc as any).userService.get_profile_image).toHaveBeenCalledWith(42);
		});

		it('get_profile throws when not found', async () => {
			const svc = makeSvc();
			(svc as any).professorRepository = {
				get_profile: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue(null),
			} as any;
			await expect(svc.get_profile({ user: { id: 1 } })).rejects.toThrow('Profile not found');
		});

		it('delete_profile checks existence then deletes', async () => {
			const svc = makeSvc();
			(svc as any).professorRepository = {
				get_profile: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue({ id: 2 }),
				delete_profile: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue({ deleted: 1 }),
			} as any;
			const out = await svc.delete_profile({ user: { id: 1 } });
			expect(out).toEqual({ deleted: 1 });
			expect((svc as any).professorRepository.delete_profile).toHaveBeenCalledWith(1);
		});
	});

	describe('edit_profile', () => {
		it('requires first_name/last_name when missing in profile', async () => {
			const svc = makeSvc();
			(svc as any).professorRepository = {
				get_profile: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue({ user: { first_name: '', last_name: '' } }),
				edit_profile: jest.fn<(...args: any[]) => Promise<any>>(),
			} as any;
			await expect(svc.edit_profile({ user: { id: 1 } }, { last_name: 'L' } as any)).rejects.toThrow(
				'First name is required'
			);
			await expect(svc.edit_profile({ user: { id: 1 } }, { first_name: 'F' } as any)).rejects.toThrow(
				'Last name is required'
			);
		});

		it('updates via repository and throws if not found', async () => {
			const svc = makeSvc();
			(svc as any).professorRepository = {
				get_profile: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue({ user: { first_name: 'A', last_name: 'B' } }),
				edit_profile: jest
					.fn<(...args: any[]) => Promise<any>>()
					.mockResolvedValueOnce(null)
					.mockResolvedValueOnce({ id: 3 }),
			} as any;
			await expect(svc.edit_profile({ user: { id: 2 } }, { first_name: 'X' } as any)).rejects.toThrow('Profile not found');
			const ok = await svc.edit_profile({ user: { id: 2 } }, { first_name: 'Y' } as any);
			expect(ok).toEqual({ id: 3 });
			expect((svc as any).professorRepository.edit_profile).toHaveBeenLastCalledWith(2, { first_name: 'Y' });
		});
	});

	describe('comments', () => {
		it('add/edit/delete_comment forward to repository', async () => {
			const svc = makeSvc();
			(svc as any).professorRepository = {
				add_comment_to_company: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue('added'),
				edit_comment: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue('edited'),
				delete_comment: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue('deleted'),
			} as any;
			await expect(svc.add_comment_to_company(1, 2, 'c')).resolves.toBe('added');
			await expect(svc.edit_comment(1, 2, 'c2')).resolves.toBe('edited');
			await expect(svc.delete_comment(1, 2)).resolves.toBe('deleted');
		});
	});

	describe('normalizePostInput', () => {
		it('trims content, defaults is_connection, sets type and job_id', async () => {
			const svc = makeSvc();
			const input = { content: '  hello  ', is_connection: false } as any;
			const out = await svc.normalizePostInput(input, AnnouncementType.Repost, 123);
			expect(out).toEqual({
				...input,
				content: 'hello',
				is_connection: false,
				job_id: 123,
				type_post: AnnouncementType.Repost,
			});
			const out2 = await svc.normalizePostInput({} as any, AnnouncementType.Announcement);
			expect(out2).toEqual({ content: null, is_connection: false, job_id: null, type_post: AnnouncementType.Announcement });
		});
	});

	describe('repost_job and announcements/opinions', () => {
		it('repost_job validates profile, job_id, not already reposted, then creates', async () => {
			const svc = makeSvc();
			(svc as any).professorRepository = {
				get_profile: jest
					.fn<(...args: any[]) => Promise<any>>()
					.mockResolvedValueOnce(null)
					.mockResolvedValueOnce({ id: 10 })
					.mockResolvedValueOnce({ id: 10 }),
				get_repost_by_job_id: jest
					.fn<(...args: any[]) => Promise<any>>()
					.mockResolvedValueOnce(false),
				create_post: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue({ id: 99 }),
			} as any;
			await expect(svc.repost_job({ user: { id: 1 } }, 123, { content: ' abc ' } as any)).rejects.toThrow('Profile not found');
			await expect(svc.repost_job({ user: { id: 1 } }, 0 as any, { content: ' abc ' } as any)).rejects.toThrow(
				'Job ID is required to repost a job'
			);
			const ok = await svc.repost_job({ user: { id: 1 } }, 123, { content: ' abc ' } as any);
			expect(ok).toEqual({ id: 99 });
			const call = (svc as any).professorRepository.create_post.mock.calls[0];
			expect(call[0]).toBe(10); // profile.id
			expect(call[1]).toMatchObject({ content: 'abc', job_id: 123, type_post: AnnouncementType.Repost });
		});

			it('create_announcement validates and creates', async () => {
			const svc = makeSvc();
			(svc as any).professorRepository = {
					get_profile: jest
						.fn<(...args: any[]) => Promise<any>>()
						.mockResolvedValueOnce(null)
						.mockResolvedValueOnce({ id: 5 })
						.mockResolvedValueOnce({ id: 5 }),
				create_post: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue({ id: 1 }),
			} as any;
			await expect(svc.create_announcement({ user: { id: 1 } }, { content: '' } as any)).rejects.toThrow(
				'Profile not found'
			);
			await expect(svc.create_announcement({ user: { id: 1 } }, { content: '' } as any)).rejects.toThrow(
				'Content is required for announcement'
			);
			const ok = await svc.create_announcement({ user: { id: 1 } }, { content: ' hi ' } as any);
			expect(ok).toEqual({ id: 1 });
			const call = (svc as any).professorRepository.create_post.mock.calls.pop();
			expect(call[0]).toBe(5);
			expect(call[1]).toMatchObject({ content: 'hi', type_post: AnnouncementType.Announcement });
		});

			it('get_all_announcement requires profile then forwards', async () => {
			const svc = makeSvc();
			(svc as any).professorRepository = {
				get_profile: jest
					.fn<(...args: any[]) => Promise<any>>()
					.mockResolvedValueOnce(null)
					.mockResolvedValueOnce({ id: 8 }),
				get_all_announcement: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue(['a']),
			} as any;
			await expect(svc.get_all_announcement({ user: { id: 1 } })).rejects.toThrow('Profile not found');
			await expect(svc.get_all_announcement({ user: { id: 1 } })).resolves.toEqual(['a']);
		});
			it('edit_post validates and forwards', async () => {
				const svc = makeSvc();
				// First call: profile not found; second call: profile ok but invalid post_id; third: ok
				(svc as any).professorRepository = {
					get_profile: jest
						.fn<(...args: any[]) => Promise<any>>()
						.mockResolvedValueOnce(null)
						.mockResolvedValueOnce({ id: 2 })
						.mockResolvedValueOnce({ id: 2 }),
					edit_post: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue({ id: 1 }),
				} as any;
				await expect(svc.edit_post({ user: { id: 1 } }, 0 as any, {} as any)).rejects.toThrow('Profile not found');
				await expect(svc.edit_post({ user: { id: 1 } }, 0 as any, {} as any)).rejects.toThrow(
					'Post ID is required to edit a post'
				);
				await expect(svc.edit_post({ user: { id: 1 } }, 11, { title: 't' } as any)).resolves.toEqual({ id: 1 });
			});

			it('delete_post validates and forwards', async () => {
				const svc = makeSvc();
				(svc as any).professorRepository = {
					get_profile: jest
						.fn<(...args: any[]) => Promise<any>>()
						.mockResolvedValueOnce(null)
						.mockResolvedValueOnce({ id: 2 })
						.mockResolvedValueOnce({ id: 2 }),
					delete_post: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue({ id: 2 }),
				} as any;
				await expect(svc.delete_post({ user: { id: 1 } }, 0 as any)).rejects.toThrow('Profile not found');
				await expect(svc.delete_post({ user: { id: 1 } }, 0 as any)).rejects.toThrow(
					'Post ID is required to delete a post'
				);
				await expect(svc.delete_post({ user: { id: 1 } }, 22)).resolves.toEqual({ id: 2 });
			});

			it('get_post_by_id validates and forwards', async () => {
				const svc = makeSvc();
				(svc as any).professorRepository = {
					get_profile: jest
						.fn<(...args: any[]) => Promise<any>>()
						.mockResolvedValueOnce(null)
						.mockResolvedValueOnce({ id: 2 })
						.mockResolvedValueOnce({ id: 2 })
						.mockResolvedValueOnce({ id: 2 }),
					get_post_by_id: jest
						.fn<(...args: any[]) => Promise<any>>()
						.mockResolvedValueOnce(null)
						.mockResolvedValueOnce({ id: 3 }),
				} as any;
				await expect(svc.get_post_by_id({ user: { id: 1 } }, 0 as any)).rejects.toThrow('Profile not found');
				await expect(svc.get_post_by_id({ user: { id: 1 } }, 0 as any)).rejects.toThrow('Post ID is required to get a post');
				await expect(svc.get_post_by_id({ user: { id: 1 } }, 33)).rejects.toThrow('Announcement not found');
				await expect(svc.get_post_by_id({ user: { id: 1 } }, 33)).resolves.toEqual({ id: 3 });
			});

			it('get_all_posts requires profile then forwards', async () => {
				const svc = makeSvc();
				(svc as any).professorRepository = {
					get_profile: jest
						.fn<(...args: any[]) => Promise<any>>()
						.mockResolvedValueOnce(null)
						.mockResolvedValueOnce({ id: 2 }),
					get_all_posts: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue(['p1']),
				} as any;
				await expect(svc.get_all_posts({ user: { id: 1 } })).rejects.toThrow('Profile not found');
				await expect(svc.get_all_posts({ user: { id: 1 } })).resolves.toEqual(['p1']);
			});

			it('create_opinion validates and creates', async () => {
				const svc = makeSvc();
				(svc as any).professorRepository = {
					get_profile: jest
						.fn<(...args: any[]) => Promise<any>>()
						.mockResolvedValueOnce(null)
						.mockResolvedValueOnce({ id: 7 })
						.mockResolvedValueOnce({ id: 7 }),
					create_post: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue({ id: 4 }),
				} as any;
				await expect(svc.create_opinion({ user: { id: 1 } }, { content: '' } as any)).rejects.toThrow('Profile not found');
				await expect(svc.create_opinion({ user: { id: 1 } }, { content: '' } as any)).rejects.toThrow(
					'Content is required for opinion'
				);
				const ok = await svc.create_opinion({ user: { id: 1 } }, { content: ' wow ' } as any);
				expect(ok).toEqual({ id: 4 });
				const call = (svc as any).professorRepository.create_post.mock.calls.pop();
				expect(call[0]).toBe(7);
				expect(call[1]).toMatchObject({ content: 'wow', type_post: AnnouncementType.Opinion });
			});

			it('get_all_opinions requires profile then forwards', async () => {
				const svc = makeSvc();
				(svc as any).professorRepository = {
					get_profile: jest
						.fn<(...args: any[]) => Promise<any>>()
						.mockResolvedValueOnce(null)
						.mockResolvedValueOnce({ id: 7 }),
					get_all_opinions: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue(['o1']),
				} as any;
				await expect(svc.get_all_opinions({ user: { id: 1 } })).rejects.toThrow('Profile not found');
				await expect(svc.get_all_opinions({ user: { id: 1 } })).resolves.toEqual(['o1']);
			});
	});
});

