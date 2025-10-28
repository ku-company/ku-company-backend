import { jest } from '@jest/globals';
import { AnnouncementService } from '../../service/announcementService.js';

const makeSvc = () => {
	const svc = new AnnouncementService();
	(svc as any).announcementRepository = {
		get_all_posts: jest.fn(),
		get_post_by_id: jest.fn(),
	};
	return svc as any;
};

describe('AnnouncementService', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('get_all_posts forwards to repository and returns list', async () => {
		const svc = makeSvc();
		const list = [{ id: 1 }, { id: 2 }];
		(svc as any).announcementRepository.get_all_posts.mockResolvedValueOnce(list);
		const out = await svc.get_all_posts();
		expect(out).toBe(list);
		expect((svc as any).announcementRepository.get_all_posts).toHaveBeenCalledTimes(1);
	});

	it('get_post_by_id forwards to repository and returns item or null', async () => {
		const svc = makeSvc();
		(svc as any).announcementRepository.get_post_by_id.mockResolvedValueOnce(null);
		const none = await svc.get_post_by_id(123);
		expect(none).toBeNull();
		expect((svc as any).announcementRepository.get_post_by_id).toHaveBeenCalledWith(123);

		const sample = { id: 99 };
		(svc as any).announcementRepository.get_post_by_id.mockResolvedValueOnce(sample);
		const out = await svc.get_post_by_id(99);
		expect(out).toBe(sample);
		expect((svc as any).announcementRepository.get_post_by_id).toHaveBeenLastCalledWith(99);
	});
});

