import { plainToInstance } from 'class-transformer';
import { User, UserDocument } from '../../modules/users/Schemas/user.schema';

export function sanitizeUser(user: UserDocument): User {
  return plainToInstance(User, user.toObject());
}
