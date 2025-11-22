import { validateExternalUrl } from '../../utils/security.js';

describe('Security: validateExternalUrl', () => {
  it('blocks javascript: scheme (Blocked protocol)', () => {
    expect(() => validateExternalUrl('javascript:alert(1)')).toThrow('Blocked protocol');
  });
  it('blocks internal IPs and localhost', () => {
    expect(() => validateExternalUrl('http://127.0.0.1')).toThrow('Blocked internal address');
    expect(() => validateExternalUrl('http://localhost')).toThrow('Blocked internal address');
  });
  it('blocks non-standard ports', () => {
    expect(() => validateExternalUrl('https://ku.th:444')).toThrow('Port not allowed');
  });
  it('allows allowlisted host and standard port', () => {
    const out = validateExternalUrl('https://ku.th', ['ku.th']);
    expect(out).toBe('https://ku.th/');
  });
});
