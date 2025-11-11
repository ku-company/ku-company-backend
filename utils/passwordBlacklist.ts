// Minimal common password denylist. Extend this list via environment or external file if needed.
// Note: For production, include the top 1000-3000 common passwords.
const COMMON_PASSWORDS = new Set<string>([
  '123456','password','123456789','12345','12345678','qwerty','1234567','111111','123123','abc123',
  'password1','iloveyou','1234','000000','1234567890','letmein','dragon','monkey','login','princess',
  'qwertyuiop','solo','passw0rd','starwars','welcome','football','admin','qwerty123','1q2w3e4r','zaq12wsx',
  'baseball','trustno1','superman','michael','sunshine','master','hello','freedom','whatever','qazwsx',
]);

export function isCommonPassword(pw: string): boolean {
  if (!pw) return false;
  const lower = pw.toLowerCase();
  return COMMON_PASSWORDS.has(lower);
}
