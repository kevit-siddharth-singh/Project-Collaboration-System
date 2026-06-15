import { UserDocument } from '../../modules/users/Schemas/user.schema';

export function sanitizeUser(user: UserDocument): Partial<UserDocument> {
  const { password, hashedRefreshToken, ...rest } = user.toObject();
  void password;
  void hashedRefreshToken;
  return rest;
}
