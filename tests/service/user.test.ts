/**
 * Jest unit tests for UserService.
 * This suite mocks external dependencies (UserRepository, S3Service, helpers)
 * so we can test logic without hitting DB/S3.
 *
 * Note: With ESM + ts-jest, ensure your jest.config uses the ESM preset
 * (ts-jest/presets/default-esm) and maps .js suffix imports, e.g.:
 *   moduleNameMapper: { "^(\\.{1,2}/.*)\\.js$": "$1" }
 */

import { jest } from '@jest/globals';

// jsonwebtoken is mapped to a local mock via moduleNameMapper in jest.config.js

// Import after mocks are defined (avoid top-level await in Jest by using beforeAll)
let UserService: any;
beforeAll(async () => {
	const mod: any = await import('../../service/userService.js');
	UserService = mod.UserService;
});

// Utilities
const setEnv = (k: string, v: string) => {
	process.env[k] = v;
};

describe('UserService', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		setEnv('BUCKET_NAME', 'bucket');
		setEnv('SECRET_KEY', 'secret');
		setEnv('REFRESH_KEY', 'refresh');
	});

	describe('sign_up validations', () => {
		it('throws when password and confirm do not match', async () => {
			const svc = new UserService();
			await expect(
				svc.sign_up({
					first_name: 'A',
					last_name: 'B',
					user_name: 'ab',
					email: 'a@b.com',
					password: 'x',
					confirm_password: 'y',
					role: 'Student'
				} as any)
			).rejects.toThrow('Password and Confirm password do not match');
		});

		it('throws when email is invalid', async () => {
			const svc = new UserService();
			await expect(
				svc.sign_up({
					first_name: 'A',
					last_name: 'B',
					user_name: 'ab',
					email: 'bad',
					password: 'x',
					confirm_password: 'x',
					role: 'Student'
				} as any)
			).rejects.toThrow('Invalid email');
		});
	});

	describe('login', () => {
		it('throws if username or password missing', async () => {
			const svc = new UserService();
			await expect(svc.login({ user_name: '', password: '' } as any)).rejects.toThrow(
				'Missing username or password'
			);
		});

		it('throws on invalid user', async () => {
			const svc = new UserService();
			// Stub repository methods directly on the service instance
			(svc as any).userRepository = {
				is_valid_user: jest.fn<() => Promise<boolean>>().mockResolvedValue(false)
			};

			await expect(svc.login({ user_name: 'john', password: 'pw' } as any)).rejects.toThrow(
				'Invalid username or password'
			);
		});

		it('returns tokens on success', async () => {
			const svc = new UserService();
			(svc as any).userRepository = {
				is_valid_user: jest.fn<() => Promise<boolean>>().mockResolvedValue(true),
				get_user_by_userName: jest.fn<() => Promise<any>>().mockResolvedValue({
				id: 10,
				user_name: 'john',
				email: 'john@example.com',
				role: 'Student',
				verified: false
				})
			};

			const res = await svc.login({ user_name: 'john', password: 'pw' } as any);
			expect(res).toHaveProperty('access_token');
			expect(res).toHaveProperty('refresh_token');
			expect(res).toMatchObject({ id: 10, user_name: 'john', email: 'john@example.com' });
		});
	});

	describe('refresh_token', () => {
		it('throws if REFRESH_KEY missing', async () => {
			const svc = new UserService();
			delete process.env.REFRESH_KEY;
			await expect(svc.refresh_token('x')).rejects.toThrow('Missing REFRESH_KEY');
		});

		it('returns new access token for valid refresh', async () => {
			const svc = new UserService();
			// create a refresh using the same service impl (jwt under the hood)
			const validPayload: any = {
				id: 1,
				user_name: 'u',
				email: 'u@e.com',
				role: 'Student',
				verified: false
			};
			// Construct a refresh by signing directly using jsonwebtoken (handle ESM/CJS interop)
			const jwtMod: any = await import('jsonwebtoken');
			const jwt = jwtMod.default ?? jwtMod;
			const refresh = jwt.sign(validPayload, process.env.REFRESH_KEY as string, { expiresIn: '5m' });
			const out = await svc.refresh_token(refresh);
			expect(out).toHaveProperty('access_token');
		});

		it('throws on invalid refresh token', async () => {
			const svc = new UserService();
			await expect(svc.refresh_token('not-a-token')).rejects.toThrow('Invalid refresh token');
		});
	});

    // image-related helpers are intentionally not tested per request
});

