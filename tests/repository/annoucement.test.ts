/**
 * Repository tests for AnnouncementRepository
 * Inject a mocked Prisma client to avoid real DB calls.
 */

import { jest } from '@jest/globals';
import { AnnouncementRepository } from '../../repository/announcementRepository.js';

const mockPrisma: any = {
	announcement: {
		findFirst: jest.fn(),
		findMany: jest.fn(),
	},
};

beforeEach(() => {
	jest.clearAllMocks();
});

const makeRepo = () => {
	const repo = new AnnouncementRepository();
	(repo as any).prisma = mockPrisma;
	return repo;
};

describe('AnnouncementRepository', () => {
	it('get_post_by_id returns matching post with include', async () => {
		const repo = makeRepo();
		const sample = { id: 10 };
		mockPrisma.announcement.findFirst.mockResolvedValueOnce(sample);
		const out = await repo.get_post_by_id(10);
		expect(out).toBe(sample);
		expect(mockPrisma.announcement.findFirst).toHaveBeenCalledWith({
			where: { id: 10 },
			include: {
				job_post: true,
				professor: {
					select: {
						user: {
							select: {
								email: true,
								verified: true,
								user_name: true,
								first_name: true,
								last_name: true,
								role: true,
							},
						},
					},
				},
			},
		});
	});

	it('get_all_posts returns list ordered desc and includes job_post', async () => {
		const repo = makeRepo();
		const list = [{ id: 1 }, { id: 2 }];
		mockPrisma.announcement.findMany.mockResolvedValueOnce(list);
		const out = await repo.get_all_posts();
		expect(out).toBe(list);
		expect(mockPrisma.announcement.findMany).toHaveBeenCalledWith({
			orderBy: { created_at: 'desc' },
			include: {
				job_post: true,
				professor: {
					select: {
						user: {
							select: {
								email: true,
								verified: true,
								user_name: true,
								first_name: true,
								last_name: true,
								role: true,
							},
						},
					},
				},
			},
		});
	});
});
