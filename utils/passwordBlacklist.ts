import fs from 'fs';
import path from 'path';

// Minimal built-in common password denylist. Can be extended via environment file.
// For production, supply a file containing the top 1000-3000 passwords (one per line)
// by setting COMMON_PASSWORDS_FILE=/absolute/path/to/top-passwords.txt
const BUILTIN_COMMON_PASSWORDS = new Set<string>([
  '123456','password','123456789','12345','12345678','qwerty','1234567','111111','123123','abc123',
  'password1','iloveyou','1234','000000','1234567890','letmein','dragon','monkey','login','princess',
  'qwertyuiop','solo','passw0rd','starwars','welcome','football','admin','qwerty123','1q2w3e4r','zaq12wsx',
  'baseball','trustno1','superman','michael','sunshine','master','hello','freedom','whatever','qazwsx',
]);

let externalList: Set<string> | null = null;

function loadExternalList(): Set<string> | null {
  const file = process.env.COMMON_PASSWORDS_FILE;
  if (!file) return null;
  try {
    const abs = path.isAbsolute(file) ? file : path.join(process.cwd(), file);
    const data = fs.readFileSync(abs, 'utf8');
    const set = new Set<string>();
    for (const line of data.split(/\r?\n/)) {
      const w = line.trim().toLowerCase();
      if (w) set.add(w);
    }
    return set;
  } catch {
    return null;
  }
}

export function isCommonPassword(pw: string): boolean {
  if (!pw) return false;
  const lower = pw.toLowerCase();
  if (!externalList) {
    externalList = loadExternalList();
  }
  if (externalList && externalList.has(lower)) return true;
  return BUILTIN_COMMON_PASSWORDS.has(lower);
}
