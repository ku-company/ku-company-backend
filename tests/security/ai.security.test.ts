import { validateExternalUrl } from '../../utils/security.js';
import { AIRepository } from '../../repository/aiRepository.js';

// We will mock gen_ai to control AI output safely.

describe('Security: AIRepository URL and prompt handling', () => {
  let repo: AIRepository;
  beforeAll(() => {
    process.env.GEMINI_API_KEY = 'fake-key'; // ensure constructor succeeds
    repo = new AIRepository();
  });

  it('sanitizes evidence_url via allowlist when updating verify status', async () => {
    // Spy on prisma calls to avoid real DB usage
    const spyUser = jest.spyOn((repo as any).prisma.user, 'findUnique').mockResolvedValue({
      id: 1,
      verified: false,
      status: 'Pending',
      email: 'prof@ku.th',
      role: 'Professor',
      first_name: 'John',
      last_name: 'Doe'
    } as any);

    const spyCreate = jest.spyOn((repo as any).prisma.aiVerification, 'create').mockResolvedValue({} as any);
    const spyUpdate = jest.spyOn((repo as any).prisma.user, 'update').mockResolvedValue({ id: 1 } as any);

    // Allowlisted domain should pass
    await expect(repo.update_verify_status(1, 'High', 'ok', 'https://scholar.google.com/profile')).resolves.toBeDefined();

    // Non-allowlisted (will be nulled internally). We test it does not throw due to unsafe URL.
    await expect(repo.update_verify_status(1, 'High', 'ok', 'https://evil.com/attack')).resolves.toBeDefined();

    // Ensure create called twice
    expect(spyCreate).toHaveBeenCalledTimes(2);

    spyUser.mockRestore();
    spyCreate.mockRestore();
    spyUpdate.mockRestore();
  });

  it('validateExternalUrl blocks internal and non-standard inputs (direct)', () => {
    expect(() => validateExternalUrl('http://localhost')).toThrow('Blocked internal address');
    expect(() => validateExternalUrl('https://example.com:444')).toThrow('Port not allowed');
  });
});
