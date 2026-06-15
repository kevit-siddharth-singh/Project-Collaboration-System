import { UserRole } from '../../../common/enums/user-role.enums';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}
