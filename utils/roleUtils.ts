import { Role } from '../utils/enums.js';

export function getValidRoles(): Role[] {
  // cast to Role[] (enum values)
  return (Object.values(Role) as Role[]).filter(
    (r) => r !== Role.Admin && r !== Role.Unknown
  );
}