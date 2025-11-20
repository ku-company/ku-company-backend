import { encodeForHTML, encodeForJSString } from '../../utils/security.js';

describe('Security: Encoding helpers', () => {
  describe('encodeForHTML', () => {
    it('escapes special HTML characters', () => {
      const input = `&<>'"`;
      const out = encodeForHTML(input);
      expect(out).toBe('&amp;&lt;&gt;&#x27;&quot;');
    });

    it('handles empty and idempotent cases', () => {
      expect(encodeForHTML('')).toBe('');
      expect(encodeForHTML('safe')).toBe('safe');
    });
  });

  describe('encodeForJSString', () => {
    it('escapes backslashes, quotes and newlines', () => {
      const input = "\\'\n\r";
      const out = encodeForJSString(input);
      expect(out).toBe('\\\\\\\'\\n\\r');
    });

    it('escapes unicode line separators U+2028 and U+2029', () => {
      const input = "\u2028\u2029";
      const out = encodeForJSString(input);
      expect(out).toBe('\\u2028\\u2029');
    });

    it('is idempotent for already safe strings', () => {
      expect(encodeForJSString('alpha')).toBe('alpha');
    });
  });
});
